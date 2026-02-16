package com.chatbot.travel.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chatbot.travel.model.Place;
import com.chatbot.travel.service.PlaceService;

@RestController
@RequestMapping("/places")
public class PlaceController {
     private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    // Add Place (Admin)
    @PostMapping
    public Place addPlace(@RequestBody Place place) {
        return placeService.addPlace(place);
    }

    // Get All Places
    @GetMapping
    public List<Place> getAllPlaces() {
        return placeService.getAllPlaces();
    }

    // Get Place by ID
    @GetMapping("/{id}")
    public Place getPlaceById(@PathVariable Long id) {
        return placeService.getPlaceById(id);
    }

    // Update Place
    @PutMapping("/{id}")
    public Place updatePlace(@PathVariable Long id,
                             @RequestBody Place place) {
        return placeService.updatePlace(id, place);
    }

    // Delete Place
    @DeleteMapping("/{id}")
    public String deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return "Place deleted successfully";
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


}
