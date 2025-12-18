package be.vives.ti.backend.model;


import jakarta.persistence.*;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.time.Month;
import java.util.Set;

@Entity
@Table(name = "crops")
public class Crop extends BaseEntity{
    @Column(name = "cropname")
    private String name;

    @Column(name = "sowing_start")
    private Month sowingStart;

    @Column(name = "sowing_end")
    private Month sowingEnd;

    @Column(name = "planting_start")
    private Month plantingStart;

    @Column(name = "planting_end")
    private Month plantingEnd;

    @Column(name = "harvest_start")
    private Month harvestStart;

    @Column(name = "harvest_end")
    private Month harvestEnd;

    @Column(name = "in_house")
    private Boolean inHouse;

    @Column(name = "in_pots")
    private Boolean inPots;

    @Column(name = "in_garden")
    private Boolean inGarden;

    @Column(name = "in_greenhouse")
    private Boolean inGreenhouse;

    @Column(name = "crop_description")
    private String cropDescription;

    @Column(name = "crop_tips")
    private String cropTips;

    @Column(name = "image")
    private String image;

    public Crop() {

    }



    public Crop(String name, Month sowingStart,
                Month sowingEnd, Month plantingStart,
                Month plantingEnd, Month harvestStart,
                Month harvestEnd, Boolean inHouse,
                Boolean inPots, Boolean inGarden,
                Boolean inGreenhouse, String cropDescription,
                String cropTips, String image) {
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
        this.image = image;
    }
    public String getImage() {
        return image;
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

    public void setName(String name) {
        this.name = name;
    }

    public void setSowingStart(Month sowingStart) {
        this.sowingStart = sowingStart;
    }

    public void setSowingEnd(Month sowingEnd) {
        this.sowingEnd = sowingEnd;
    }

    public void setPlantingStart(Month plantingStart) {
        this.plantingStart = plantingStart;
    }

    public void setPlantingEnd(Month plantingEnd) {
        this.plantingEnd = plantingEnd;
    }

    public void setHarvestStart(Month harvestStart) {
        this.harvestStart = harvestStart;
    }

    public void setHarvestEnd(Month harvestEnd) {
        this.harvestEnd = harvestEnd;
    }

    public void setInHouse(Boolean inHouse) {
        this.inHouse = inHouse;
    }

    public void setInPots(Boolean inPots) {
        this.inPots = inPots;
    }

    public void setInGarden(Boolean inGarden) {
        this.inGarden = inGarden;
    }

    public void setInGreenhouse(Boolean inGreenhouse) {
        this.inGreenhouse = inGreenhouse;
    }

    public void setCropDescription(String cropDescription) {
        this.cropDescription = cropDescription;
    }

    public void setCropTips(String cropTips) {
        this.cropTips = cropTips;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
