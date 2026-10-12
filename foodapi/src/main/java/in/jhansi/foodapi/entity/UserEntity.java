package in.jhansi.foodapi.entity;

import java.util.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "users")
public class UserEntity {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    @JsonIgnore
    private String password;

    private String phone;

    @Builder.Default
    private String role = "ROLE_CUSTOMER";

    @Builder.Default
    private boolean active = true;

    private String restaurantId;

    private String resetPasswordToken;

    private String resetPasswordOtp;

    private Date resetPasswordTokenExpiry;

    @Builder.Default
    private Date createdAt = new Date();
}
