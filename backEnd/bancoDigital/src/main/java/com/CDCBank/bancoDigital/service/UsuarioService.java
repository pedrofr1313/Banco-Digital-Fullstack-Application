package com.CDCBank.bancoDigital.service;

import com.CDCBank.bancoDigital.dto.request.PatchUserDTO;
import com.CDCBank.bancoDigital.dto.request.UsuarioCreateDTO;
import com.CDCBank.bancoDigital.exception.DuplicateResourceException;
import com.CDCBank.bancoDigital.exception.ResourceNotFoundException;
import com.CDCBank.bancoDigital.exception.UserNotFoundException;
import com.CDCBank.bancoDigital.models.Usuario;
import com.CDCBank.bancoDigital.repository.UsuarioRepository;

import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
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

     @Transactional
    public Usuario findByUsername(String email) {
        log.info("Buscando usuário com email: {}", email);
        return usuarioRepository.findAll().stream()
                .filter(usuario -> usuario.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email)); }

    
     @Transactional
    public Usuario findById(Long id) {
        log.info("Buscando usuário com id: {}", id);
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id)); 
            }

    /**
    
    
                /**
     * 
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

     /**
     * Método para deletar um usuário pelo ID.
     * 
     * @param id O ID do usuário a ser deletado.
     */
    @Transactional
    public void deleteById(Long id) {
        if(usuarioRepository.findById(id).isEmpty()){
       throw new UserNotFoundException("Usuário não encontrado com ID: " + id);
        }
        log.info("Deletando usuário com ID: {}", id);
        usuarioRepository.deleteById(id);
        log.info("Usuário com ID: {} deletado com sucesso", id);
    }


      /**
     * Método para listar todos os usuários.
     * 
     * @return Lista de todos os usuários.
     */
    @Transactional
    public List<Usuario> findAll() {
        log.info("Listando todos os usuários");
        return usuarioRepository.findAll();
    }

@Transactional
@CacheEvict(value = "informacoes", allEntries = true)
public Usuario atualizarCampos(PatchUserDTO informacoes) {
    if (informacoes == null) {
        throw new IllegalArgumentException("Pelo menos uma configuração deve ser fornecida para atualização");
    }

    if (informacoes.getId() == null) {
        throw new IllegalArgumentException("ID do usuário é obrigatório para atualização");
    }

   
    if (informacoes.getNome() == null && 
        informacoes.getDataNascimento() == null && 
        informacoes.getRendaMensal() == null) {
        throw new IllegalArgumentException("Pelo menos um campo deve ser fornecido para atualização");
    }

    log.info("Atualizando configurações específicas: {}", informacoes.toString());

    Optional<Usuario> usuarioOptional = usuarioRepository.findById(informacoes.getId());
    
    if (usuarioOptional.isEmpty()) {
        throw new EntityNotFoundException("Usuário não encontrado com ID: " + informacoes.getId());
    }

    Usuario usuarioExistente = usuarioOptional.get();

    // Atualiza apenas os campos não-nulos fornecidos
    boolean houveMudanca = false;

    if (informacoes.getNome() != null && !informacoes.getNome().trim().isEmpty()) {
        if (!informacoes.getNome().equals(usuarioExistente.getNome())) {
            usuarioExistente.setNome(informacoes.getNome().trim());
            houveMudanca = true;
            log.debug("Nome atualizado para: {}", informacoes.getNome());
        }
    }

    if (informacoes.getDataNascimento() != null) {
        if (!informacoes.getDataNascimento().equals(usuarioExistente.getDataNascimento())) {
            if (informacoes.getDataNascimento().after(new Date())) {
                throw new IllegalArgumentException("Data de nascimento não pode ser no futuro");
            }
            usuarioExistente.setDataNascimento(informacoes.getDataNascimento());
            houveMudanca = true;
            log.debug("Data de nascimento atualizada para: {}", informacoes.getDataNascimento());
        }
    }

    if (informacoes.getRendaMensal() != null) {
        if (Float.compare(informacoes.getRendaMensal(), usuarioExistente.getRendaMensal()) != 0) {
            usuarioExistente.setRendaMensal(informacoes.getRendaMensal());
            houveMudanca = true;
            log.debug("Renda mensal atualizada para: {}", informacoes.getRendaMensal());
        }
    }

    if (!houveMudanca) {
        log.info("Nenhuma alteração detectada para o usuário ID: {}", informacoes.getId());
        return usuarioExistente; 
    }

    

    Usuario usuarioAtualizado = usuarioRepository.save(usuarioExistente);
    
    log.info("Usuário atualizado com sucesso. ID: {}", usuarioAtualizado.getId());
    
    return usuarioAtualizado;
}


}