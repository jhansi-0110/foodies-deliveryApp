package in.jhansi.foodapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

@SpringBootApplication
public class FoodapiApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext ctx = SpringApplication.run(FoodapiApplication.class, args);
		Environment env = ctx.getEnvironment();
		System.out.println(">>> MONGO URI RESOLVED AS: " + env.getProperty("spring.data.mongodb.uri"));
	}

}