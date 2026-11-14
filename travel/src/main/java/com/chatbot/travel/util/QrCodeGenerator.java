package com.chatbot.travel.util;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import javax.imageio.ImageIO;

/**
 * Lightweight, zero-dependency QR code generator supporting byte mode with Error Correction Level M.
 * Produces standard valid QR codes renderable as BufferedImage or PNG byte array.
 */
public final class QrCodeGenerator {

    private QrCodeGenerator() {}

    /**
     * Generates a QR Code PNG image byte array for the given text.
     *
     * @param text       the text to encode
     * @param pixelScale size of each module in pixels (e.g. 8)
     * @return PNG image bytes
     */
    public static byte[] generateQrPng(String text, int pixelScale) throws IOException {
        boolean[][] matrix = encodeToMatrix(text);
        int border = 4;
        int matrixSize = matrix.length;
        int imageSize = (matrixSize + border * 2) * pixelScale;

        BufferedImage image = new BufferedImage(imageSize, imageSize, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, imageSize, imageSize);
        g.setColor(new Color(24, 43, 73)); // Elegant deep navy/dark for QR modules

        for (int y = 0; y < matrixSize; y++) {
            for (int x = 0; x < matrixSize; x++) {
                if (matrix[y][x]) {
                    g.fillRect((x + border) * pixelScale, (y + border) * pixelScale, pixelScale, pixelScale);
                }
            }
        }
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", baos);
        return baos.toByteArray();
    }

    /**
     * Encodes text to a standard QR Code matrix (supports typical ticket payload lengths <= 80 chars).
     */
    public static boolean[][] encodeToMatrix(String text) {
        byte[] data = text.getBytes(StandardCharsets.UTF_8);
        int version = selectVersion(data.length);
        int size = 17 + 4 * version;
        boolean[][] grid = new boolean[size][size];
        boolean[][] isFunction = new boolean[size][size];

        // 1. Finder patterns
        drawFinderPattern(grid, isFunction, 0, 0);
        drawFinderPattern(grid, isFunction, size - 7, 0);
        drawFinderPattern(grid, isFunction, 0, size - 7);

        // 2. Alignment patterns for version >= 2
        int[] alignPositions = getAlignmentPatternPositions(version);
        for (int i = 0; i < alignPositions.length; i++) {
            for (int j = 0; j < alignPositions.length; j++) {
                int ax = alignPositions[i];
                int ay = alignPositions[j];
                if ((ax == 6 && ay == 6) ||
                    (ax == 6 && ay == size - 7) ||
                    (ax == size - 7 && ay == 6)) {
                    continue; // Skip finders
                }
                drawAlignmentPattern(grid, isFunction, ax - 2, ay - 2);
            }
        }

        // 3. Timing patterns
        for (int i = 8; i < size - 8; i++) {
            boolean bit = (i % 2 == 0);
            if (!isFunction[6][i]) {
                grid[6][i] = bit;
                isFunction[6][i] = true;
            }
            if (!isFunction[i][6]) {
                grid[i][6] = bit;
                isFunction[i][6] = true;
            }
        }

        // 4. Dark module
        grid[4 * version + 9][8] = true;
        isFunction[4 * version + 9][8] = true;

        // 5. Reserve format info areas
        for (int i = 0; i <= 8; i++) {
            isFunction[i][8] = true;
            isFunction[8][i] = true;
            isFunction[size - 1 - i][8] = true;
            isFunction[8][size - 1 - i] = true;
        }

        // 6. Assemble codewords (Data + Reed Solomon ECC)
        byte[] codewords = makeCodewords(data, version);

        // 7. Place data bits in matrix (zigzag)
        placeDataBits(grid, isFunction, codewords);

        // 8. Apply mask pattern 0 ( (x + y) % 2 == 0 ) and draw format bits
        applyMask0AndFormat(grid, isFunction, version);

        return grid;
    }

    private static int selectVersion(int byteLen) {
        if (byteLen <= 14) return 1;
        if (byteLen <= 26) return 2;
        if (byteLen <= 42) return 3;
        if (byteLen <= 62) return 4;
        return 5;
    }

    private static int[] getAlignmentPatternPositions(int version) {
        if (version == 1) return new int[0];
        if (version == 2) return new int[]{6, 18};
        if (version == 3) return new int[]{6, 22};
        if (version == 4) return new int[]{6, 26};
        return new int[]{6, 30};
    }

    private static void drawFinderPattern(boolean[][] grid, boolean[][] isFunc, int x, int y) {
        for (int r = -1; r <= 7; r++) {
            for (int c = -1; c <= 7; c++) {
                int px = x + c;
                int py = y + r;
                if (px >= 0 && px < grid.length && py >= 0 && py < grid.length) {
                    isFunc[py][px] = true;
                    if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
                        grid[py][px] = (r == 0 || r == 6 || c == 0 || c == 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
                    } else {
                        grid[py][px] = false;
                    }
                }
            }
        }
    }

    private static void drawAlignmentPattern(boolean[][] grid, boolean[][] isFunc, int x, int y) {
        for (int r = 0; r < 5; r++) {
            for (int c = 0; c < 5; c++) {
                int px = x + c;
                int py = y + r;
                isFunc[py][px] = true;
                grid[py][px] = (r == 0 || r == 4 || c == 0 || c == 4 || (r == 2 && c == 2));
            }
        }
    }

    private static byte[] makeCodewords(byte[] data, int version) {
        int[] totalCodewords = {0, 26, 44, 70, 100, 134};
        int[] dataCodewords = {0, 16, 28, 44, 64, 86};
        int[] eccCodewords = {0, 10, 16, 26, 36, 48};

        int totalCap = totalCodewords[version];
        int dataCap = dataCodewords[version];
        int eccCap = eccCodewords[version];

        // Byte mode indicator: 0100 (4 bits)
        // Character count: 8 bits
        BitBuffer bb = new BitBuffer();
        bb.appendBits(0b0100, 4);
        bb.appendBits(data.length, 8);
        for (byte b : data) {
            bb.appendBits(b & 0xFF, 8);
        }

        // Terminator (up to 4 zero bits)
        int bitsNeeded = dataCap * 8;
        int terminator = Math.min(4, bitsNeeded - bb.bitLength);
        if (terminator > 0) {
            bb.appendBits(0, terminator);
        }
        // Byte pad
        while (bb.bitLength % 8 != 0) {
            bb.appendBits(0, 1);
        }
        // Pad bytes 0xEC, 0x11
        int pad = 0;
        while (bb.getBytes().length < dataCap) {
            bb.appendBits((pad++ % 2 == 0) ? 0xEC : 0x11, 8);
        }

        byte[] dataBytes = bb.getBytes();
        byte[] ecc = computeReedSolomon(dataBytes, eccCap);

        byte[] allCodewords = new byte[totalCap];
        System.arraycopy(dataBytes, 0, allCodewords, 0, dataBytes.length);
        System.arraycopy(ecc, 0, allCodewords, dataBytes.length, ecc.length);
        return allCodewords;
    }

    private static byte[] computeReedSolomon(byte[] data, int ecCount) {
        int[] genPoly = getGeneratorPolynomial(ecCount);
        int[] res = new int[data.length + ecCount];
        for (int i = 0; i < data.length; i++) {
            res[i] = data[i] & 0xFF;
        }

        for (int i = 0; i < data.length; i++) {
            int coef = res[i];
            if (coef != 0) {
                for (int j = 0; j < genPoly.length; j++) {
                    res[i + j] ^= gfMultiply(genPoly[j], coef);
                }
            }
        }

        byte[] ecc = new byte[ecCount];
        for (int i = 0; i < ecCount; i++) {
            ecc[i] = (byte) res[data.length + i];
        }
        return ecc;
    }

    private static int[] getGeneratorPolynomial(int degree) {
        int[] poly = {1};
        for (int i = 0; i < degree; i++) {
            poly = polyMultiply(poly, new int[]{1, gfPow(2, i)});
        }
        return poly;
    }

    private static int[] polyMultiply(int[] p1, int[] p2) {
        int[] res = new int[p1.length + p2.length - 1];
        for (int i = 0; i < p1.length; i++) {
            for (int j = 0; j < p2.length; j++) {
                res[i + j] ^= gfMultiply(p1[i], p2[j]);
            }
        }
        return res;
    }

    private static int gfMultiply(int x, int y) {
        if (x == 0 || y == 0) return 0;
        return GF_EXP[(GF_LOG[x] + GF_LOG[y]) % 255];
    }

    private static int gfPow(int base, int exp) {
        if (exp == 0) return 1;
        int res = 1;
        for (int i = 0; i < exp; i++) {
            res = gfMultiply(res, base);
        }
        return res;
    }

    private static final int[] GF_EXP = new int[512];
    private static final int[] GF_LOG = new int[256];
    static {
        int x = 1;
        for (int i = 0; i < 255; i++) {
            GF_EXP[i] = x;
            GF_EXP[i + 255] = x;
            GF_LOG[x] = i;
            x <<= 1;
            if ((x & 0x100) != 0) {
                x ^= 0x11D;
            }
        }
    }

    private static void placeDataBits(boolean[][] grid, boolean[][] isFunc, byte[] codewords) {
        int size = grid.length;
        int bitIndex = 0;
        int totalBits = codewords.length * 8;

        for (int right = size - 1; right > 0; right -= 2) {
            if (right == 6) right--; // skip timing col
            for (int vert = 0; vert < size; vert++) {
                for (int j = 0; j < 2; j++) {
                    int x = right - j;
                    boolean upward = ((right + 1) & 2) == 0;
                    int y = upward ? (size - 1 - vert) : vert;

                    if (!isFunc[y][x]) {
                        boolean bit = false;
                        if (bitIndex < totalBits) {
                            int byteIdx = bitIndex / 8;
                            int bitSub = 7 - (bitIndex % 8);
                            bit = ((codewords[byteIdx] >>> bitSub) & 1) != 0;
                            bitIndex++;
                        }
                        grid[y][x] = bit;
                    }
                }
            }
        }
    }

    private static void applyMask0AndFormat(boolean[][] grid, boolean[][] isFunc, int version) {
        int size = grid.length;
        // Mask 0: (x + y) % 2 == 0
        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                if (!isFunc[y][x]) {
                    if ((x + y) % 2 == 0) {
                        grid[y][x] = !grid[y][x];
                    }
                }
            }
        }

        // Format bits for ECC Level M (00) and Mask 0 (000) -> 00 000
        // Standard format codeword for (M, 0): 101010000010010 (0x5412)
        int formatBits = 0x5412;
        for (int i = 0; i < 15; i++) {
            boolean bit = ((formatBits >>> (14 - i)) & 1) != 0;
            // Top-left finder border
            if (i <= 5) grid[8][i] = bit;
            else if (i == 6) grid[8][7] = bit;
            else if (i == 7) grid[8][8] = bit;
            else if (i == 8) grid[7][8] = bit;
            else grid[14 - i][8] = bit;

            // Split across bottom-left and top-right
            if (i < 8) {
                grid[size - 1 - i][8] = bit;
            } else {
                grid[8][size - 15 + i] = bit;
            }
        }
    }

    private static class BitBuffer {
        int[] buffer = new int[512];
        int bitLength = 0;

        void appendBits(int val, int count) {
            for (int i = count - 1; i >= 0; i--) {
                int bit = (val >>> i) & 1;
                int byteIdx = bitLength / 8;
                buffer[byteIdx] = (buffer[byteIdx] << 1) | bit;
                bitLength++;
            }
        }

        byte[] getBytes() {
            int byteCount = (bitLength + 7) / 8;
            byte[] res = new byte[byteCount];
            for (int i = 0; i < byteCount; i++) {
                res[i] = (byte) buffer[i];
            }
            return res;
        }
    }
}
