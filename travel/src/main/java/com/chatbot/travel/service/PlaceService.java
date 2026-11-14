package com.chatbot.travel.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatbot.travel.model.Place;
import com.chatbot.travel.model.User;
import com.chatbot.travel.model.enums.Role;
import com.chatbot.travel.repository.PlaceRepository;
import com.chatbot.travel.repository.UserRepository;

@Service
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    public PlaceService(PlaceRepository placeRepository,
                        UserRepository userRepository) {
        this.placeRepository = placeRepository;
        this.userRepository = userRepository;
    }

    // ================= HELPER METHOD =================

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getName())) {
            return null;
        }

        return userRepository
                .findByEmail(authentication.getName())
                .orElse(null);
    }

    // ================= ADD PLACE =================

    public Place addPlace(Place place) {

        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized: Authentication required to add places");
        }

        // Region must be provided
        if (place.getRegion() == null) {
            throw new RuntimeException("Region is mandatory");
        }

        if (currentUser.getRole() == Role.REGIONAL_ADMIN) {
            // Regional admin can only add to their region
            if (!place.getRegion().equals(currentUser.getRegion())) {
                throw new RuntimeException(
                        "You can only add places to your own region (" + currentUser.getRegion() + ")");
            }
        }

        if (place.getDailyCapacity() == null && place.getAvailableSlots() != null) {
            place.setDailyCapacity(place.getAvailableSlots());
        } else if (place.getAvailableSlots() == null && place.getDailyCapacity() != null) {
            place.setAvailableSlots(place.getDailyCapacity());
        }
        place.setAdmin(currentUser);

        return placeRepository.save(place);
    }

    // ================= GET ALL =================

    public List<Place> getAllPlaces() {

        User currentUser = getCurrentUser();

        if (currentUser != null && currentUser.getRole() == Role.REGIONAL_ADMIN) {
            return placeRepository
                    .findByRegion(currentUser.getRegion());
        }

        return placeRepository.findAll();
    }

    // ================= GET BY ID =================

    public Place getPlaceById(Long id) {

        Place place = placeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Place not found with id: " + id));

        User currentUser = getCurrentUser();

        if (currentUser != null && currentUser.getRole() == Role.REGIONAL_ADMIN) {
            if (!place.getRegion().equals(currentUser.getRegion())) {
                throw new RuntimeException(
                        "You cannot access place outside your region");
            }
        }

        return place;
    }

    // ================= UPDATE PLACE =================

    @Transactional
    public Place updatePlace(Long id, Place updatedPlace) {

        Place place = getPlaceById(id);
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized: Authentication required to update places");
        }

        if (currentUser.getRole() == Role.REGIONAL_ADMIN) {

            if (!place.getRegion().equals(currentUser.getRegion())) {
                throw new RuntimeException(
                        "You cannot update place outside your region");
            }

            // Prevent changing region
            if (!updatedPlace.getRegion()
                    .equals(currentUser.getRegion())) {
                throw new RuntimeException(
                        "Cannot change region");
            }
        }

        place.setName(updatedPlace.getName());
        place.setState(updatedPlace.getState());
        place.setCity(updatedPlace.getCity());
        place.setDescription(updatedPlace.getDescription());
        place.setAdultPrice(updatedPlace.getAdultPrice());
        place.setChildPrice(updatedPlace.getChildPrice());
        place.setAvailableSlots(updatedPlace.getAvailableSlots());
        if (updatedPlace.getDailyCapacity() != null) {
            place.setDailyCapacity(updatedPlace.getDailyCapacity());
        }
        if (updatedPlace.getAliases() != null) {
            place.setAliases(updatedPlace.getAliases());
        }
        place.setOpeningTime(updatedPlace.getOpeningTime());
        place.setClosingTime(updatedPlace.getClosingTime());
        place.setRegion(updatedPlace.getRegion());

        return place;
    }

    // ================= DELETE PLACE =================

    @Transactional
    public void deletePlace(Long id) {

        Place place = getPlaceById(id);
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new RuntimeException("Unauthorized: Authentication required to delete places");
        }

        if (currentUser.getRole() == Role.REGIONAL_ADMIN) {

            if (!place.getRegion().equals(currentUser.getRegion())) {
                throw new RuntimeException(
                        "You cannot delete place outside your region");
            }
        }

        placeRepository.delete(place);
    }

    // ================= SEARCH =================

    public List<Place> searchByCity(String city) {

        User currentUser = getCurrentUser();

        if (currentUser != null && currentUser.getRole() == Role.REGIONAL_ADMIN) {
            return placeRepository
                    .findByCityAndRegion(city, currentUser.getRegion());
        }

        return placeRepository.findByCity(city);
    }

    public List<Place> searchByState(String state) {

        User currentUser = getCurrentUser();

        if (currentUser != null && currentUser.getRole() == Role.REGIONAL_ADMIN) {
            return placeRepository
                    .findByStateAndRegion(state, currentUser.getRegion());
        }

        return placeRepository.findByState(state);
    }

    public List<Place> searchByName(String name) {

        User currentUser = getCurrentUser();

        if (currentUser != null && currentUser.getRole() == Role.REGIONAL_ADMIN) {
            return placeRepository
                    .findByNameContainingIgnoreCaseAndRegion(
                            name, currentUser.getRegion());
        }

        return placeRepository
                .findByNameContainingIgnoreCase(name);
    }
}