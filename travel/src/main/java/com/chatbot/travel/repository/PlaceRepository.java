package com.chatbot.travel.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chatbot.travel.model.Place;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

    List<Place> findByState(String state);

    List<Place> findByCity(String city);

    List<Place> findByNameContainingIgnoreCase(String name);
    
}
