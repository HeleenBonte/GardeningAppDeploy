package be.vives.ti.backend.model;

import jakarta.persistence.*;

@Entity
public class Category extends BaseEntity{
    @Column(name = "categoryName")
    private Integer name;

    public Category() {
    }

    public Category(Integer name) {
        this.name = name;
    }

    public Integer getName() {
        return name;
    }


}
