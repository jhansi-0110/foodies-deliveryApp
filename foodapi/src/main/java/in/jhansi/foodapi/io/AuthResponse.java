package in.jhansi.foodapi.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private String id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String restaurantId;
    private boolean active;
}
