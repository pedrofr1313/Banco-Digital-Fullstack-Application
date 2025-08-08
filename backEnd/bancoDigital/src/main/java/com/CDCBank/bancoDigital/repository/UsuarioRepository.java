package com.CDCBank.bancoDigital.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import com.CDCBank.bancoDigital.models.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    UserDetails findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByIdFiscal(String idFiscal);
}