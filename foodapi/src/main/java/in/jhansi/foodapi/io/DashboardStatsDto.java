package in.jhansi.foodapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDto {

    private long totalCustomers;
    private long totalRestaurants;
    private long activeRestaurants;
    private long inactiveRestaurants;
    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private long successfulPayments;
    private long failedPayments;
    private double totalRevenue;
    private long activeSubscriptions;
    private long expiredSubscriptions;
}
