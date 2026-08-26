package com.server.gateway.filter;


import org.springframework.web.servlet.function.ServerRequest;

import java.util.function.Function;

//Custom filter to extract jwt from cookie and set it in the header as bearer token before passing the request to microservice

public class JwtCookieFilter {
    public static Function<ServerRequest, ServerRequest> addJwtToHeader() {

        return request -> {

            var cookies = request.cookies().get("AUTH_TOKEN");

            if (cookies == null || cookies.isEmpty()) {
                return request;
            }

            String token = cookies.getFirst().getValue();

            return ServerRequest.from(request)
                    .header("Authorization", "Bearer " + token)
                    .build();
        };
    }
}
