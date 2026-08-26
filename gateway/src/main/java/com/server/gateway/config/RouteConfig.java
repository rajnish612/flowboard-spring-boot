package com.server.gateway.config;

//Configuration for routes

import com.server.gateway.filter.JwtCookieFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.stripPrefix;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;


//Custom configuration to manage routes of microservice
@Configuration
public class RouteConfig {
    @Bean
    public RouterFunction<ServerResponse> authServiceRoute() {

        return route("authservice")
                .GET("/authservice/**", http())

                // AUTH_TOKEN cookie → Authorization: Bearer JWT
                .before(JwtCookieFilter.addJwtToHeader())


                .before(stripPrefix(1))

                // Forward to Auth Service through Eureka
                .filter(lb("authservice"))

                .build();
    }
}
