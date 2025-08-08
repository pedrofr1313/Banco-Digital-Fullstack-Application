package com.CDCBank.bancoDigital.service;

import com.CDCBank.bancoDigital.dto.request.UsuarioCreateDTO;
import com.CDCBank.bancoDigital.exception.DuplicateResourceException;
import com.CDCBank.bancoDigital.models.Usuario;
import com.CDCBank.bancoDigital.repository.UsuarioRepository;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Método para salvar um usuário no repositório.
     * 
     * @param usuario O usuário a ser salvo.
     * @return O usuário salvo.
     */
    @Transactional
    public Usuario saveUsuario(Usuario usuario) {
        log.info("Salvando usuário: {}", usuario);
        return usuarioRepository.save(usuario);
    }

    /**
     * Método para criar um novo usuário a partir de um DTO.
     * 
     * @param usuarioCreateDTO O DTO com os dados do usuário a ser criado.
     * @return O usuário criado.
     */
    @Transactional
    public Usuario create(UsuarioCreateDTO usuarioCreateDTO) {
        log.info("Criando usuário: {}", usuarioCreateDTO.getNome());

        // Verificação de email duplicado
        if (usuarioRepository.existsByEmail(usuarioCreateDTO.getEmail())) {
            throw new DuplicateResourceException("Já existe um usuário com este email: " + usuarioCreateDTO.getEmail());
        }

        // Verificação de ID Fiscal duplicado - CORRIGIDO
        if (usuarioRepository.existsByIdFiscal(usuarioCreateDTO.getIdFiscal())) {
            throw new DuplicateResourceException("Já existe um usuário com este ID Fiscal: " + usuarioCreateDTO.getIdFiscal());
        }

        Usuario usuario = new Usuario();
        usuario.setNome(usuarioCreateDTO.getNome());
        usuario.setEmail(usuarioCreateDTO.getEmail());
        usuario.setSenha(passwordEncoder.encode(usuarioCreateDTO.getSenha()));
        usuario.setIdFiscal(usuarioCreateDTO.getIdFiscal());
        usuario.setDataNascimento(usuarioCreateDTO.getDataNascimento());
        usuario.setRendaMensal(usuarioCreateDTO.getRendaMensal());
        usuario.setSaldo(100.0f); // Inicializa o saldo como 100.0

        Usuario usuarioSalvo = saveUsuario(usuario);
        log.info("Usuário criado com sucesso - ID: {} | Email: {}",
                usuarioSalvo.getId(), usuarioSalvo.getEmail());

        return usuarioSalvo;
    }
}