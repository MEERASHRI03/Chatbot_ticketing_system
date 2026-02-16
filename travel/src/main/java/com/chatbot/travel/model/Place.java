package com.chatbot.travel.model;

import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Entity
@Table(name = "places")

public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long placeId;

    @NotBlank(message = "Place name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "State is required")
    @Column(nullable = false)
    private String state;

    @NotBlank(message = "City is required")
    @Column(nullable = false)
    private String city;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Adult price is required")
    @Positive(message = "Adult price must be positive")
    @Column(nullable = false)
    private Double adultPrice;

    @NotNull(message = "Child price is required")
    @Positive(message = "Child price must be positive")
    @Column(nullable = false)
    private Double childPrice;

    @NotNull(message = "Available slots required")
    @Positive(message = "Available slots must be positive")
    @Column(nullable = false)
    private Integer availableSlots;

    @NotNull(message = "Opening time required")
    @Column(nullable = false)
    private LocalTime openingTime;

    @NotNull(message = "Closing time required")
    @Column(nullable = false)
    private LocalTime closingTime;

    //Default Constructor
    public Place() {
    }

    //Parameterized Constructor
    public Place(String name, String state, String city, String description,
                 Double adultPrice, Double childPrice,
                 Integer availableSlots,
                 LocalTime openingTime, LocalTime closingTime) {
        this.name = name;
        this.state = state;
        this.city = city;
        this.description = description;
        this.adultPrice = adultPrice;
        this.childPrice = childPrice;
        this.availableSlots = availableSlots;
        this.openingTime = openingTime;
        this.closingTime = closingTime;
    }


    public Long getPlaceId() {
        return placeId;
    }

    public void setPlaceId(Long placeId) {
        this.placeId = placeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getAdultPrice() {
        return adultPrice;
    }

    public void setAdultPrice(Double adultPrice) {
        this.adultPrice = adultPrice;
    }

    public Double getChildPrice() {
        return childPrice;
    }

    public void setChildPrice(Double childPrice) {
        this.childPrice = childPrice;
    }

    public Integer getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(Integer availableSlots) {
        this.availableSlots = availableSlots;
    }

    public LocalTime getOpeningTime() {
        return openingTime;
    }

    public void setOpeningTime(LocalTime openingTime) {
        this.openingTime = openingTime;
    }

    public LocalTime getClosingTime() {
        return closingTime;
    }

    public void setClosingTime(LocalTime closingTime) {
        this.closingTime = closingTime;
    }

    //toString()

    @Override
    public String toString() {
        return "Place{" +
                "placeId=" + placeId +
                ", name='" + name + '\'' +
                ", state='" + state + '\'' +
                ", city='" + city + '\'' +
                ", adultPrice=" + adultPrice +
                ", childPrice=" + childPrice +
                ", availableSlots=" + availableSlots +
                ", openingTime=" + openingTime +
                ", closingTime=" + closingTime +
                '}';
    }
}
