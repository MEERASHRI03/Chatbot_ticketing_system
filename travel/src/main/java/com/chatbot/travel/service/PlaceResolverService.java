package com.chatbot.travel.service;

import com.chatbot.travel.model.Place;
import com.chatbot.travel.repository.PlaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlaceResolverService {

    private final PlaceRepository placeRepository;

    public PlaceResolverService(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    public List<Place> resolveByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return List.of();
        }
        return placeRepository.findByNameContainingIgnoreCase(name.trim());
    }
}
