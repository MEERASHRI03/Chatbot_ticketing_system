package com.chatbot.travel.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.chatbot.travel.model.Place;
import com.chatbot.travel.service.PlaceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/places")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    // ================= USER ACCESS =================

    // Get All Places (Everyone)
    @GetMapping
    public List<Place> getAllPlaces() {
        return placeService.getAllPlaces();
    }

    // Get Place by ID (Everyone)
    @GetMapping("/{id}")
    public Place getPlaceById(@PathVariable Long id) {
        return placeService.getPlaceById(id);
    }

    // Search by City
    @GetMapping("/city/{city}")
    public List<Place> searchByCity(@PathVariable String city) {
        return placeService.searchByCity(city);
    }

    // Search by State
    @GetMapping("/state/{state}")
    public List<Place> searchByState(@PathVariable String state) {
        return placeService.searchByState(state);
    }

    // Search by Name
    @GetMapping("/name/{name}")
    public List<Place> searchByName(@PathVariable String name) {
        return placeService.searchByName(name);
    }

    // ================= ADMIN ACCESS =================

    // Add Place → REGIONAL_ADMIN + SUPER_ADMIN
    @PostMapping
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public Place addPlace(@Valid @RequestBody Place place) {
        return placeService.addPlace(place);
    }

    // Update Place → REGIONAL_ADMIN + SUPER_ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public Place updatePlace(@PathVariable Long id,
                             @Valid @RequestBody Place place) {
        return placeService.updatePlace(id, place);
    }

    // Delete Place → REGIONAL_ADMIN + SUPER_ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('REGIONAL_ADMIN','SUPER_ADMIN')")
    public String deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return "Place deleted successfully";
    }
}