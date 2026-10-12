package in.jhansi.foodapi.io;

import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {

    private String restaurantId;

    @NotEmpty(message = "Order must contain items")
    private List<Map<String, Object>> items;

    private double amount; // Optional client hint; backend always recalculates using DB prices

    @NotNull(message = "Address details are required")
    private Map<String, Object> address;
}
