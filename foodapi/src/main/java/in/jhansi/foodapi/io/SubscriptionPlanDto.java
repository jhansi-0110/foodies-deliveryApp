package in.jhansi.foodapi.io;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubscriptionPlanDto {

    private String planId; // BASIC, STANDARD, PREMIUM
    private String name;
    private double price;
    private int billingPeriodDays;
    private int maxMenuItems;
    private List<String> features;
    private String description;
}
