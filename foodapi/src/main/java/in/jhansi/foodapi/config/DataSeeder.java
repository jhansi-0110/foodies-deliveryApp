package in.jhansi.foodapi.config;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import in.jhansi.foodapi.entity.FoodEntity;
import in.jhansi.foodapi.entity.RestaurantEntity;
import in.jhansi.foodapi.entity.SubscriptionEntity;
import in.jhansi.foodapi.entity.UserEntity;
import in.jhansi.foodapi.repository.FoodRepository;
import in.jhansi.foodapi.repository.RestaurantRepository;
import in.jhansi.foodapi.repository.SubscriptionRepository;
import in.jhansi.foodapi.repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting DataSeeder verification for realistic demo data...");

        // 1. Ensure Platform Admin
        seedUser("Platform Administrator", "admin@foodies.com", "admin123", "9999999999", "ROLE_ADMIN", null);

        // 2. Customers
        seedUser("Rahul Sharma", "rahul@gmail.com", "rahul123", "9876543211", "ROLE_CUSTOMER", null);
        seedUser("Sneha Reddy", "sneha@gmail.com", "sneha123", "9876543212", "ROLE_CUSTOMER", null);
        seedUser("Amit Patel", "amit@gmail.com", "amit123", "9876543213", "ROLE_CUSTOMER", null);

        // 3. Restaurants & Partners
        // Restaurant 1: Royal Biryani House
        UserEntity biryaniOwner = seedUser("Ananya Rao", "ananya@royalbiryani.com", "biryani123", "9876543220", "ROLE_RESTAURANT", null);
        RestaurantEntity biryaniRest = seedRestaurant(
                "Royal Biryani House",
                "Authentic dum biryanis, aromatic kebabs, and Mughlai royal delicacies",
                "Biryani, North Indian",
                "Plot 42, Hitec City Main Road",
                "Hyderabad",
                "500081",
                "9876543220",
                "ananya@royalbiryani.com",
                "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80",
                4.9, 35, 30.0, 199.0,
                biryaniOwner
        );

        // Restaurant 2: Urban Crust Pizza Co.
        UserEntity pizzaOwner = seedUser("Marco Rossi", "marco@urbancrust.com", "pizza123", "9876543221", "ROLE_RESTAURANT", null);
        RestaurantEntity pizzaRest = seedRestaurant(
                "Urban Crust Pizza Co.",
                "Handcrafted wood-fired Neapolitan pizzas and creamy Italian pastas",
                "Pizza, Pasta, Italian",
                "100 Feet Road, Indiranagar",
                "Bengaluru",
                "560038",
                "9876543221",
                "marco@urbancrust.com",
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80",
                4.8, 28, 25.0, 199.0,
                pizzaOwner
        );

        // Restaurant 3: The Green Bowl & Cafe
        UserEntity saladOwner = seedUser("Priya Nair", "priya@greenbowl.com", "green123", "9876543222", "ROLE_RESTAURANT", null);
        RestaurantEntity saladRest = seedRestaurant(
                "The Green Bowl & Cafe",
                "Wholesome garden salads, power grain bowls, cold brew and fresh juices",
                "Salad, Healthy, Drinks",
                "5th Block, Koramangala",
                "Bengaluru",
                "560095",
                "9876543222",
                "priya@greenbowl.com",
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80",
                4.7, 20, 20.0, 99.0,
                saladOwner
        );

        // Restaurant 4: Sweet Cravings Patisserie
        UserEntity dessertOwner = seedUser("Rohit Verma", "rohit@sweetcravings.com", "sweet123", "9876543223", "ROLE_RESTAURANT", null);
        RestaurantEntity dessertRest = seedRestaurant(
                "Sweet Cravings Patisserie",
                "Artisan cakes, gelato ice creams, gourmet shakes and fresh bakes",
                "Cake, Ice Creames, Desserts",
                "27th Main, Sector 1, HSR Layout",
                "Bengaluru",
                "560102",
                "9876543223",
                "rohit@sweetcravings.com",
                "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&auto=format&fit=crop&q=80",
                4.9, 22, 20.0, 99.0,
                dessertOwner
        );

        // Restaurant 5: Spice Garden Kitchen
        UserEntity spiceOwner = seedUser("Vikram Chef", "vikram@spicekitchen.com", "spice123", "9876543210", "ROLE_RESTAURANT", null);
        RestaurantEntity spiceRest = seedRestaurant(
                "Spice Garden Kitchen",
                "Signature claypot curries, handcrafted burgers and savory fast bites",
                "Burger, Rolls, South Indian",
                "Road 36, Jubilee Hills",
                "Hyderabad",
                "500033",
                "9876543210",
                "vikram@spicekitchen.com",
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80",
                4.8, 30, 25.0, 149.0,
                spiceOwner
        );

        // 4. Seed / Reassign Food Dishes with real Cloudinary URLs
        assignOrSeedFood("Egg Biryani", "Aromatic basmati rice cooked with boiled eggs, herbs, and flavorful Indian spices.", 180.0, "Biryani", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590378/food-images/fhbhpfv9ljwmjemeg4p0.avif", false, biryaniRest);
        assignOrSeedFood("Chicken Roll", "Soft flatbread filled with seasoned chicken, fresh vegetables, and creamy sauce.", 150.0, "Rolls", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590244/food-images/uritbznmp5sq7qwgxkks.avif", false, biryaniRest);
        assignOrSeedFood("Egg Roll", "Soft flatbread wrapped around seasoned egg, vegetables, and flavorful sauces.", 120.0, "Rolls", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590352/food-images/a7pdfydjnky5jtbneuvf.webp", false, biryaniRest);

        assignOrSeedFood("Margherita Pizza", "Classic pizza topped with tomato sauce, mozzarella cheese, and fresh basil.", 220.0, "Pizza", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590539/food-images/josivhfcgoy1p87emvmc.avif", true, pizzaRest);
        assignOrSeedFood("Farm House Pizza", "Classic vegetarian pizza topped with fresh mushrooms, onions, peppers, tomatoes, and mozzarella.", 280.0, "Pizza", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590404/food-images/wikzx45wocebykiqvmla.avif", true, pizzaRest);
        assignOrSeedFood("Chicken Pizza", "Delicious pizza topped with seasoned chicken, mozzarella cheese, and fresh vegetables.", 280.0, "Pizza", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590216/food-images/l0jvh7wlfb40tejy4aem.avif", false, pizzaRest);
        assignOrSeedFood("Alfredo pizza", "Rich flavorful chicken pizza with white alfredo sauce and herbs.", 199.0, "Pizza", "https://res.cloudinary.com/f0hhntaj/image/upload/v1791788217/food-images/jfv9juca20y9pdvmdznb.avif", false, pizzaRest);
        assignOrSeedFood("Chicken Pasta", "Pasta cooked with tender chicken, vegetables, herbs, and a flavorful creamy sauce.", 230.0, "Pasta", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590183/food-images/tpk5nxhtxg2k6jt4r3lz.webp", false, pizzaRest);

        assignOrSeedFood("Garden Salad", "Fresh seasonal vegetables tossed with a light and refreshing dressing.", 150.0, "Salad", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590434/food-images/qmg8tzdlp2qf8hnlyfyo.avif", true, saladRest);
        assignOrSeedFood("Greek Salad", "Fresh cucumber, tomatoes, onions, olives, and feta cheese tossed with a light dressing.", 180.0, "Salad", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590459/food-images/gydgdr75p2qoevpaxmsx.webp", true, saladRest);
        assignOrSeedFood("Lime Soda", "Refreshing lime drink blended with chilled soda, fresh lime juice, and a hint of sweetness.", 70.0, "Drinks", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590488/food-images/gseupxsv0eefrfsxid6b.avif", true, saladRest);
        assignOrSeedFood("Cold Coffee", "Chilled creamy coffee blended with milk and a touch of sweetness for a refreshing drink.", 120.0, "Drinks", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590326/food-images/rmrtc9cjcpf7u1qw4tis.avif", true, saladRest);

        assignOrSeedFood("Choco Ice Cream", "Rich and creamy chocolate ice cream with an indulgent cocoa flavor.", 100.0, "Ice Creames", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590272/food-images/xl4fkxow5gtnaqr1xqns.avif", true, dessertRest);
        assignOrSeedFood("Choco Cake", "Moist chocolate cake with a rich chocolate flavor and smooth creamy frosting.", 160.0, "Cake", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590300/food-images/qmajauf5z1eina3e0nrx.avif", true, dessertRest);
        assignOrSeedFood("Mango Milkshake", "Thick and creamy milkshake made with ripe mangoes and chilled milk.", 140.0, "Drinks", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590515/food-images/dno1lajshpmscwpux70k.avif", true, dessertRest);

        assignOrSeedFood("Cheesy Burger", "Juicy burger patty topped with melted cheese, fresh vegetables, and flavorful sauce in a soft bun.", 180.0, "Burger", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590131/food-images/d6xt0ndimiguq6gaj44a.jpg", false, spiceRest);
        assignOrSeedFood("Chicken Burger", "Tender chicken patty served with fresh lettuce, vegetables, and signature sauce in a toasted bun.", 190.0, "Burger", "https://res.cloudinary.com/f0hhntaj/image/upload/v1788590161/food-images/s6ksllfyjdcfk6vxwywt.avif", false, spiceRest);

        log.info("DataSeeder completed successfully. All 5 demo partner restaurants and menus are active!");
    }

    private UserEntity seedUser(String name, String email, String password, String phone, String role, String restaurantId) {
        String normalizedEmail = email.toLowerCase().trim();
        Optional<UserEntity> existing = userRepository.findByEmail(normalizedEmail);
        if (existing.isPresent()) {
            UserEntity user = existing.get();
            if (restaurantId != null && user.getRestaurantId() == null) {
                user.setRestaurantId(restaurantId);
                userRepository.save(user);
            }
            return user;
        }

        UserEntity user = UserEntity.builder()
                .name(name)
                .email(normalizedEmail)
                .password(passwordEncoder.encode(password))
                .phone(phone)
                .role(role)
                .restaurantId(restaurantId)
                .active(true)
                .createdAt(new Date())
                .build();

        return userRepository.save(user);
    }

    private RestaurantEntity seedRestaurant(
            String name, String description, String cuisine, String address, String city, String postalCode,
            String phone, String email, String imageUrl, double rating, int deliveryTime, double fee, double minOrder,
            UserEntity owner
    ) {
        List<RestaurantEntity> existing = restaurantRepository.findByOwnerId(owner.getId());
        RestaurantEntity rest;
        if (!existing.isEmpty()) {
            rest = existing.get(0);
            rest.setName(name);
            rest.setDescription(description);
            rest.setCuisine(cuisine);
            rest.setAddress(address);
            rest.setCity(city);
            rest.setImageUrl(imageUrl);
            rest.setApproved(true);
            rest.setActive(true);
            rest.setOpen(true);
            rest = restaurantRepository.save(rest);
        } else {
            Date expiry = new Date(System.currentTimeMillis() + (365L * 24 * 60 * 60 * 1000)); // 1 year
            rest = RestaurantEntity.builder()
                    .name(name)
                    .description(description)
                    .cuisine(cuisine)
                    .address(address)
                    .city(city)
                    .postalCode(postalCode)
                    .phone(phone)
                    .email(email)
                    .imageUrl(imageUrl)
                    .rating(rating)
                    .deliveryTimeMinutes(deliveryTime)
                    .deliveryFee(fee)
                    .minimumOrder(minOrder)
                    .open(true)
                    .active(true)
                    .approved(true)
                    .ownerId(owner.getId())
                    .ownerName(owner.getName())
                    .ownerEmail(owner.getEmail())
                    .subscriptionStatus("ACTIVE")
                    .subscriptionPlan("PREMIUM")
                    .subscriptionExpiresAt(expiry)
                    .createdAt(new Date())
                    .build();

            rest = restaurantRepository.save(rest);
        }

        // Link restaurant id back to owner
        if (owner.getRestaurantId() == null || !owner.getRestaurantId().equals(rest.getId())) {
            owner.setRestaurantId(rest.getId());
            userRepository.save(owner);
        }

        // Ensure active subscription record exists
        List<SubscriptionEntity> subs = subscriptionRepository.findByRestaurantId(rest.getId());
        if (subs.isEmpty()) {
            SubscriptionEntity sub = SubscriptionEntity.builder()
                    .restaurantId(rest.getId())
                    .restaurantName(rest.getName())
                    .ownerId(owner.getId())
                    .ownerEmail(owner.getEmail())
                    .planName("PREMIUM")
                    .amount(2499.0)
                    .billingPeriodDays(365)
                    .maxMenuItems(500)
                    .status("ACTIVE")
                    .startDate(new Date())
                    .endDate(new Date(System.currentTimeMillis() + (365L * 24 * 60 * 60 * 1000)))
                    .createdAt(new Date())
                    .build();
            subscriptionRepository.save(sub);
        }

        return rest;
    }

    private void assignOrSeedFood(
            String name, String description, double price, String category, String imageUrl, boolean veg, RestaurantEntity rest
    ) {
        List<FoodEntity> foods = foodRepository.findByNameContainingIgnoreCase(name);
        if (!foods.isEmpty()) {
            FoodEntity food = foods.get(0);
            food.setRestaurantId(rest.getId());
            food.setRestaurantName(rest.getName());
            food.setImageUrl(imageUrl);
            food.setVeg(veg);
            food.setPrice(price);
            food.setCategory(category);
            food.setAvailable(true);
            foodRepository.save(food);
        } else {
            FoodEntity food = FoodEntity.builder()
                    .name(name)
                    .description(description)
                    .price(price)
                    .category(category)
                    .imageUrl(imageUrl)
                    .veg(veg)
                    .restaurantId(rest.getId())
                    .restaurantName(rest.getName())
                    .available(true)
                    .rating(4.8)
                    .build();
            foodRepository.save(food);
        }
    }
}
