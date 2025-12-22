package be.vives.ti.backend.controller;

import be.vives.ti.backend.dto.request.CreateCropRequest;
import be.vives.ti.backend.dto.request.UpdateCropRequest;
import be.vives.ti.backend.dto.response.CropResponse;
import be.vives.ti.backend.service.CropService;
import be.vives.ti.backend.security.JwtUtil;
import be.vives.ti.backend.exceptions.GlobalExceptionHandler;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.context.annotation.Primary;
import org.springframework.test.annotation.DirtiesContext;

import java.time.Month;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.mockito.Mockito;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CropController.class)
@Import({GlobalExceptionHandler.class, CropControllerTest.TestConfig.class})
@AutoConfigureMockMvc(addFilters = false)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class CropControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CropService cropService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    @DisplayName("GET /api/crops - when crops exist returns 200 and page")
    void getAllCrops_returnsPage() throws Exception {
        CropResponse c1 = new CropResponse(1, "Tomato", Month.MARCH, Month.MAY, Month.APRIL, Month.MAY, Month.AUGUST, Month.SEPTEMBER, true, false, true, false, "desc", "tips", "img");
        CropResponse c2 = new CropResponse(2, "Cucumber", Month.APRIL, Month.JUNE, Month.MAY, Month.JUNE, Month.SEPTEMBER, Month.OCTOBER, false, true, true, false, "desc2", "tips2", "img2");
        var page = new PageImpl<>(List.of(c1, c2));
        when(cropService.findAll(Mockito.any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/crops")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Tomato"));
    }

    @Test
    @DisplayName("GET /api/crops - when service throws -> returns 500")
    void getAllCrops_whenServiceThrows_returnsInternalServerError() throws Exception {
        doThrow(new IllegalStateException("boom")).when(cropService).findAll(Mockito.any(Pageable.class));

        mockMvc.perform(get("/api/crops")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("GET /api/crops/{id} - when found returns 200")
    void getById_found_returns200() throws Exception {
        CropResponse c = new CropResponse(1, "Tomato", Month.MARCH, Month.MAY, Month.APRIL, Month.MAY, Month.AUGUST, Month.SEPTEMBER, true, false, true, false, "desc", "tips", "img");
        doReturn(c).when(cropService).findById(1);

        mockMvc.perform(get("/api/crops/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Tomato"));
    }

    @Test
    @DisplayName("GET /api/crops/{id} - when not found returns 404")
    void getById_notFound_returns404() throws Exception {
        doReturn(null).when(cropService).findById(99);

        mockMvc.perform(get("/api/crops/99").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/crops/search - when name match returns page")
    void getByName_returnsPage() throws Exception {
        CropResponse c = new CropResponse(1, "Tomato", Month.MARCH, Month.MAY, Month.APRIL, Month.MAY, Month.AUGUST, Month.SEPTEMBER, true, false, true, false, "desc", "tips", "img");
        var page = new PageImpl<>(List.of(c));
        when(cropService.findByNameContaining(Mockito.eq("Tom"), Mockito.any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/crops/search").param("name", "Tom").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Tomato"));
    }

    @Test
    @DisplayName("POST /api/crops - when valid returns 201")
    void createCrop_valid_returnsCreated() throws Exception {
        Map<String, Object> request = Map.ofEntries(
                Map.entry("name", "Tomato"),
                Map.entry("sowingStart", "MARCH"),
                Map.entry("sowingEnd", "MAY"),
                Map.entry("plantingStart", "APRIL"),
                Map.entry("plantingEnd", "MAY"),
                Map.entry("harvestStart", "AUGUST"),
                Map.entry("harvestEnd", "SEPTEMBER"),
                Map.entry("inHouse", true),
                Map.entry("inPots", false),
                Map.entry("inGarden", true),
                Map.entry("inGreenhouse", false),
                Map.entry("cropDescription", "desc"),
                Map.entry("cropTips", "tips"),
                Map.entry("image", "img")
        );

        CropResponse created = new CropResponse(10, "Tomato", Month.MARCH, Month.MAY, Month.APRIL, Month.MAY, Month.AUGUST, Month.SEPTEMBER, true, false, true, false, "desc", "tips", "img");
        when(cropService.create(Mockito.any(CreateCropRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/crops")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/api/crops/10")))
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.name").value("Tomato"));
    }

    @Test
    @DisplayName("POST /api/crops - when invalid returns 400")
    void createCrop_invalid_returnsBadRequest() throws Exception {
        // missing required fields
        mockMvc.perform(post("/api/crops")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/crops/{id} - when found returns 200")
    void updateCrop_found_returns200() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Updated",
                "cropDescription", "desc"
        );
        CropResponse updated = new CropResponse(1, "Updated", Month.MARCH, Month.MAY, Month.APRIL, Month.MAY, Month.AUGUST, Month.SEPTEMBER, true, false, true, false, "desc", "tips", "img");
        when(cropService.update(Mockito.eq(1), Mockito.any(UpdateCropRequest.class))).thenReturn(java.util.Optional.of(updated));

        mockMvc.perform(put("/api/crops/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    @DisplayName("PUT /api/crops/{id} - when not found returns 404")
    void updateCrop_notFound_returns404() throws Exception {
        Map<String, Object> request = Map.of(
                "name", "Updated"
        );
        when(cropService.update(Mockito.eq(99), Mockito.any(UpdateCropRequest.class))).thenReturn(java.util.Optional.empty());

        mockMvc.perform(put("/api/crops/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/crops/{id} - when deleted returns 204")
    void deleteCrop_deleted_returnsNoContent() throws Exception {
        doReturn(true).when(cropService).delete(1);

        mockMvc.perform(delete("/api/crops/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/crops/{id} - when not found returns 404")
    void deleteCrop_notFound_returns404() throws Exception {
        doReturn(false).when(cropService).delete(99);

        mockMvc.perform(delete("/api/crops/99"))
                .andExpect(status().isNotFound());
    }

    @TestConfiguration
    public static class TestConfig {

        @Bean
        @Primary
        public CropService cropService() {
            return Mockito.mock(CropService.class);
        }

        @Bean
        public JwtUtil jwtUtil() {
            return Mockito.mock(JwtUtil.class);
        }

        @Bean
        public UserDetailsService userDetailsService() {
            return Mockito.mock(UserDetailsService.class);
        }
    }
}
