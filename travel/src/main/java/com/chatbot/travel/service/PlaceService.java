package com.chatbot.travel.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chatbot.travel.model.Place;
import com.chatbot.travel.repository.PlaceRepository;

@Service
public class PlaceService {
    
    @Autowired
    private  PlaceRepository placeRepository;

    public PlaceService(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    // Add Place (Admin)
    public Place addPlace(Place place) {
        return placeRepository.save(place);
    }

    // Get All Places
    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    // Get Place by ID
    public Place getPlaceById(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found"));
    }

    // Update Place
    public Place updatePlace(Long id, Place updatedPlace) {
        Place place = getPlaceById(id);

        place.setName(updatedPlace.getName());
        place.setState(updatedPlace.getState());
        place.setCity(updatedPlace.getCity());
        place.setDescription(updatedPlace.getDescription());
        place.setAdultPrice(updatedPlace.getAdultPrice());
        place.setChildPrice(updatedPlace.getChildPrice());
        place.setAvailableSlots(updatedPlace.getAvailableSlots());
        place.setOpeningTime(updatedPlace.getOpeningTime());
        place.setClosingTime(updatedPlace.getClosingTime());

        return placeRepository.save(place);
    }

    // Delete Place
    public void deletePlace(Long id) {
        placeRepository.deleteById(id);
    }

    // Search
    public List<Place> searchByCity(String city) {
        return placeRepository.findByCity(city);
    }

    public List<Place> searchByState(String state) {
        return placeRepository.findByState(state);
    }

    public List<Place> searchByName(String name) {
        return placeRepository.findByNameContainingIgnoreCase(name);
    }
}
