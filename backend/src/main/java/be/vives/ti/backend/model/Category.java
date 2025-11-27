package be.vives.ti.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
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
