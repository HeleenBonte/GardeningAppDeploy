package be.vives.ti.backend.model;


import jakarta.persistence.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.time.Month;
import java.util.Set;

@Entity
public class Crop extends BaseEntity{
    @Column(name = "cropName")
    private String name;

    @Column(name = "sowingStart")
    private Month sowingStart;

    @Column(name = "sowingEnd")
    private Month sowingEnd;

    @Column(name = "plantingStart")
    private Month plantingStart;

    @Column(name = "plantingEnd")
    private Month plantingEnd;

    @Column(name = "harvestStart")
    private Month harvestStart;

    @Column(name = "harvestEnd")
    private Month harvestEnd;

    @Column(name = "inHouse")
    private Boolean inHouse;

    @Column(name = "inPots")
    private Boolean inPots;

    @Column(name = "inGarden")
    private Boolean inGarden;

    @Column(name = "inGreenhouse")
    private Boolean inGreenhouse;

    @Column(name = "cropDescription")
    private String cropDescription;

    @Column(name = "cropTips")
    private String cropTips;

    public Crop() {

    }

    public Crop(String name, Month sowingStart,
                Month sowingEnd, Month plantingStart,
                Month plantingEnd, Month harvestStart,
                Month harvestEnd, Boolean inHouse,
                Boolean inPots, Boolean inGarden,
                Boolean inGreenhouse, String cropDescription,
                String cropTips) {
        this.name = name;
        this.sowingStart = sowingStart;
        this.sowingEnd = sowingEnd;
        this.plantingStart = plantingStart;
        this.plantingEnd = plantingEnd;
        this.harvestStart = harvestStart;
        this.harvestEnd = harvestEnd;
        this.inHouse = inHouse;
        this.inPots = inPots;
        this.inGarden = inGarden;
        this.inGreenhouse = inGreenhouse;
        this.cropDescription = cropDescription;
        this.cropTips = cropTips;
    }

    public String getName() {
        return name;
    }

    public Month getSowingStart() {
        return sowingStart;
    }

    public Month getSowingEnd() {
        return sowingEnd;
    }

    public Month getPlantingStart() {
        return plantingStart;
    }

    public Month getPlantingEnd() {
        return plantingEnd;
    }

    public Month getHarvestStart() {
        return harvestStart;
    }

    public Month getHarvestEnd() {
        return harvestEnd;
    }

    public Boolean getInHouse() {
        return inHouse;
    }

    public Boolean getInPots() {
        return inPots;
    }

    public Boolean getInGarden() {
        return inGarden;
    }

    public Boolean getInGreenhouse() {
        return inGreenhouse;
    }

    public String getCropDescription() {
        return cropDescription;
    }

    public String getCropTips() {
        return cropTips;
    }
}
