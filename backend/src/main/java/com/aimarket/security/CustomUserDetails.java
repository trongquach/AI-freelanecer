package com.aimarket.security;

import com.aimarket.entity.User;
import com.aimarket.entity.enums.UserRole;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {

    private final Long userId;
    private final String email;
    private final String password;
    private final UserRole role;
    private final boolean enabled;

    public CustomUserDetails(User user) {
        this.userId   = user.getId();
        this.email    = user.getEmail();
        this.password = user.getPasswordHash();
        this.role     = user.getRole();
        this.enabled  = com.aimarket.entity.enums.UserStatus.ACTIVE.equals(user.getStatus());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getUsername()            { return email; }
    @Override public String getPassword()            { return password; }
    @Override public boolean isAccountNonExpired()   { return true; }
    @Override public boolean isAccountNonLocked()    { return enabled; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled()             { return enabled; }
}
