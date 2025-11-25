package be.vives.ti.backend.model;


import jakarta.persistence.*;

@Entity
public class Course extends BaseEntity{
    @Column(name = "courseName")
    private String name;

    public Course() {
    }

    public Course(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
