package be.vives.ti.backend.model;


import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role extends BaseEntity{
    @Column(name = "name")
    private String name;

}
