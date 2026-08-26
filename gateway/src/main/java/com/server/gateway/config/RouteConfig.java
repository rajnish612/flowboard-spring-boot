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

        //Auth service route
        return route("authservice")
                .GET("/api/auth/**", http())

                // AUTH_TOKEN cookie → Authorization: Bearer JWT
                .before(JwtCookieFilter.addJwtToHeader())
                .before(stripPrefix(2))

                // Forward to Auth Service through Eureka
                .filter(lb("authservice"))

                .build();

    }

    //route to handle google oauth login
    @Bean
    public RouterFunction<ServerResponse> oauthRoute() {

        return route("oauth")
                .GET("/oauth2/**", http())
                .filter(lb("authservice"))
                .build();
    }

    //Redirect callback route after successful oauth login
    @Bean
    public RouterFunction<ServerResponse> oauthCallbackRoute() {

        return route("oauth-callback")
                .GET("/login/**", http())
                .filter(lb("authservice"))
                .build();
    }


}
