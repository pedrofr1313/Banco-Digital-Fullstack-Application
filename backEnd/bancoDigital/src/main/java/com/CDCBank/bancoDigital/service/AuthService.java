package com.CDCBank.bancoDigital.service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.CDCBank.bancoDigital.repository.UsuarioRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.info("Buscando usuário por email: {}", email);
        
        UserDetails usuario = usuarioRepository.findByEmail(email);
        
        if (usuario == null) {
            log.error("Usuário não encontrado com email: {}", email);
            throw new UsernameNotFoundException("Usuário não encontrado com email: " + email);
        }
        
        log.info("Usuário encontrado: {}", email);
        return usuario;
    }
}