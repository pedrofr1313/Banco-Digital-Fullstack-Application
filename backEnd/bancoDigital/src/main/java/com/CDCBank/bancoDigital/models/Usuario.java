package com.CDCBank.bancoDigital.models;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.Collection;
import java.util.List;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuario")
public class Usuario implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_generator")
    private Long id;

    @Column(nullable=false)
    private String nome;

     @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable=false)
    private String idFiscal;

     @Column(nullable = false)
    private Date dataNascimento;
    
    @Column(nullable = false)
    private String senha;

    @Column(nullable = false)
    private Float saldo;
    
    @Column(nullable = false)
    private float rendaMensal;

    @Override
    public String getPassword() {
        return this.senha;
    }

    @Override
    public String getUsername() {
        return this.email;
    }
     @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
    
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
