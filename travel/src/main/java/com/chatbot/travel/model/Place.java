package com.chatbot.travel.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private User admin;

    @OneToMany(mappedBy = "place", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();

    public Place() {}

    public Place(String name, String state, String city, String description,
                 Double adultPrice, Double childPrice, Integer availableSlots,
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

    public Long getPlaceId() { return placeId; }
    public void setPlaceId(Long placeId) { this.placeId = placeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getAdultPrice() { return adultPrice; }
    public void setAdultPrice(Double adultPrice) { this.adultPrice = adultPrice; }

    public Double getChildPrice() { return childPrice; }
    public void setChildPrice(Double childPrice) { this.childPrice = childPrice; }

    public Integer getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(Integer availableSlots) { this.availableSlots = availableSlots; }

    public LocalTime getOpeningTime() { return openingTime; }
    public void setOpeningTime(LocalTime openingTime) { this.openingTime = openingTime; }

    public LocalTime getClosingTime() { return closingTime; }
    public void setClosingTime(LocalTime closingTime) { this.closingTime = closingTime; }

    public User getAdmin() { return admin; }
    public void setAdmin(User admin) { this.admin = admin; }

    public List<Booking> getBookings() { return bookings; }
    public void setBookings(List<Booking> bookings) { this.bookings = bookings; }

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
