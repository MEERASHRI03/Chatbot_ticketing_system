package com.chatbot.travel.config;

import com.chatbot.travel.model.Place;
import com.chatbot.travel.model.User;
import com.chatbot.travel.model.enums.Region;
import com.chatbot.travel.model.enums.Role;
import com.chatbot.travel.repository.PlaceRepository;
import com.chatbot.travel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(PlaceRepository placeRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.placeRepository = placeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedSamplePlaces();
        seedDefaultGuestUser();
        seedDefaultAdminUser();
    }

    public void seedDefaultAdminUser() {
        if (!userRepository.existsByEmail("admin@travel.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@travel.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhone("9876543210");
            admin.setRole(Role.SUPER_ADMIN);
            admin.setRegion(Region.NORTH);
            userRepository.save(admin);
            log.info("Seeded default super admin (admin@travel.com / admin123)");
        }
    }

    public void seedDefaultGuestUser() {
        if (!userRepository.existsByEmail("guest@chatbot.travel")) {
            User guest = new User();
            guest.setName("Chatbot Guest");
            guest.setEmail("guest@chatbot.travel");
            guest.setPassword("$2a$10$7EqJtq98hPqEX7fNZaFWoO8bM/P5Y74b9N7w.hS3N/Qc5rT1g8k2a");
            guest.setPhone("9999999999");
            guest.setRole(Role.USER);
            userRepository.save(guest);
            log.info("Seeded default guest user (guest@chatbot.travel)");
        }
    }

    public void seedSamplePlaces() {
        List<Place> existingPlaces = placeRepository.findAll();
        if (existingPlaces.size() >= 8) {
            log.info("Sample places already seeded ({} found)", existingPlaces.size());
            return;
        }

        createPlaceIfMissing("Red Fort", "Delhi", "New Delhi",
                "Historic Mughal fortress complex built of red sandstone in the heart of Delhi.",
                35.0, 15.0, 1000, "lal qila, red fort delhi, lal quila", Region.NORTH);

        createPlaceIfMissing("Taj Mahal", "Uttar Pradesh", "Agra",
                "An immense mausoleum of white marble, one of the wonders of the world.",
                50.0, 20.0, 1500, "taj, tajmahal, agra monument, crown of the palace", Region.NORTH);

        createPlaceIfMissing("Qutub Minar", "Delhi", "New Delhi",
                "Minaret that forms part of the Qutb complex, a UNESCO World Heritage Site.",
                35.0, 15.0, 800, "qutb minar, qutab minar, victory tower", Region.NORTH);

        createPlaceIfMissing("Hawa Mahal", "Rajasthan", "Jaipur",
                "The Palace of Winds with intricate honeycomb pink sandstone facade.",
                50.0, 20.0, 600, "palace of winds, hawa mahal jaipur", Region.NORTH);

        createPlaceIfMissing("Amber Fort", "Rajasthan", "Jaipur",
                "Majestic hilltop fort known for its artistic Hindu elements and sweeping vistas.",
                100.0, 50.0, 800, "amer fort, amber palace, jaipur fort", Region.NORTH);

        createPlaceIfMissing("India Gate", "Delhi", "New Delhi",
                "War memorial dedicated to the soldiers of the British Indian Army.",
                20.0, 10.0, 2000, "all india war memorial, war memorial delhi", Region.NORTH);

        createPlaceIfMissing("Gateway of India", "Maharashtra", "Mumbai",
                "Iconic arch monument overlooking the Arabian Sea in Mumbai.",
                30.0, 15.0, 1200, "gateway, gateway mumbai, landmark", Region.WEST);

        createPlaceIfMissing("Mysore Palace", "Karnataka", "Mysore",
                "A historical palace and royal residence located in Mysore, renowned for its architecture.",
                70.0, 30.0, 1000, "mysuru palace, amba vilas palace", Region.SOUTH);
    }

    private void createPlaceIfMissing(String name,
                                      String state,
                                      String city,
                                      String description,
                                      Double adultPrice,
                                      Double childPrice,
                                      Integer capacity,
                                      String aliases,
                                      Region region) {
        List<Place> match = placeRepository.findByNameContainingIgnoreCase(name);
        if (match.isEmpty()) {
            Place place = new Place();
            place.setName(name);
            place.setState(state);
            place.setCity(city);
            place.setDescription(description);
            place.setAdultPrice(adultPrice);
            place.setChildPrice(childPrice);
            place.setAvailableSlots(capacity);
            place.setDailyCapacity(capacity);
            place.setAliases(aliases);
            place.setActive(true);
            place.setOpeningTime(LocalTime.of(9, 0));
            place.setClosingTime(LocalTime.of(18, 0));
            place.setRegion(region);
            placeRepository.save(place);
            log.info("Seeded place: {}", name);
        }
    }
}
