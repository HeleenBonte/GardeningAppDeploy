package be.vives.ti.backend.model;


import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course extends BaseEntity{
    @Column(name = "course_name")
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
