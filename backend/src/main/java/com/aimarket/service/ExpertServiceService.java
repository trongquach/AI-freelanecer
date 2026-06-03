package com.aimarket.service;

import com.aimarket.dto.service.*;
import com.aimarket.entity.ExpertService;
import com.aimarket.entity.Skill;
import com.aimarket.entity.User;
import com.aimarket.entity.enums.ServiceStatus;
import com.aimarket.entity.enums.UserRole;
import com.aimarket.exception.*;
import com.aimarket.repository.ExpertServiceRepository;
import com.aimarket.repository.SkillRepository;
import com.aimarket.repository.UserRepository;
import com.aimarket.dto.PageResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpertServiceService {

    private final ExpertServiceRepository serviceRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ObjectMapper objectMapper;

    // ─── Create ───────────────────────────────────────────
    @Transactional
    public ServiceResponse createService(CreateServiceRequest request, Long expertId) {
        User expert = userRepository.findById(expertId)
                .orElseThrow(() -> new ResourceNotFoundException("User", expertId));
        if (expert.getRole() != UserRole.EXPERT) throw new ForbiddenException("Only experts can create services");

        Set<Skill> skills = resolveSkills(request.skillIds());

        ExpertService svc = ExpertService.builder()
                .expert(expert)
                .title(request.title())
                .description(request.description())
                .price(request.price())
                .deliveryDays(request.deliveryDays())
                .tags(toJson(request.tags()))
                .status(ServiceStatus.PENDING_REVIEW)
                .skills(skills)
                .build();

        return toResponse(serviceRepository.save(svc));
    }

    // ─── Update ───────────────────────────────────────────
    @Transactional
    public ServiceResponse updateService(Long id, CreateServiceRequest request, Long expertId) {
        ExpertService svc = findOrThrow(id);
        if (!svc.getExpert().getId().equals(expertId)) throw new ForbiddenException();
        if (svc.getStatus() == ServiceStatus.ACTIVE)
            throw new BusinessException("Cannot edit an active service — deactivate it first");

        svc.setTitle(request.title());
        svc.setDescription(request.description());
        svc.setPrice(request.price());
        svc.setDeliveryDays(request.deliveryDays());
        svc.setTags(toJson(request.tags()));
        svc.setSkills(resolveSkills(request.skillIds()));
        return toResponse(serviceRepository.save(svc));
    }

    // ─── Admin: Activate ──────────────────────────────────
    @Transactional
    public ServiceResponse activateService(Long id) {
        ExpertService svc = findOrThrow(id);
        svc.setStatus(ServiceStatus.ACTIVE);
        return toResponse(serviceRepository.save(svc));
    }

    // ─── Expert: Deactivate ───────────────────────────────
    @Transactional
    public ServiceResponse deactivateService(Long id, Long expertId) {
        ExpertService svc = findOrThrow(id);
        if (!svc.getExpert().getId().equals(expertId)) throw new ForbiddenException();
        svc.setStatus(ServiceStatus.INACTIVE);
        return toResponse(serviceRepository.save(svc));
    }

    // ─── Delete ───────────────────────────────────────────
    @Transactional
    public void deleteService(Long id, Long userId, UserRole role) {
        ExpertService svc = findOrThrow(id);
        if (role != UserRole.ADMIN && !svc.getExpert().getId().equals(userId)) throw new ForbiddenException();
        serviceRepository.delete(svc);
    }

    // ─── Browse Marketplace ───────────────────────────────
    @Transactional(readOnly = true)
    public PageResponse<ServiceResponse> browseMarketplace(String keyword, BigDecimal minPrice,
            BigDecimal maxPrice, Integer maxDays, BigDecimal minRating,
            String sortBy, int page, int size) {
        Sort sort = switch (sortBy != null ? sortBy : "NEWEST") {
            case "PRICE_ASC"  -> Sort.by("price").ascending();
            case "PRICE_DESC" -> Sort.by("price").descending();
            case "RATING"     -> Sort.by("rating").descending();
            default           -> Sort.by("createdAt").descending();
        };
        Page<ServiceResponse> result = serviceRepository.findWithFilter(keyword, minPrice, maxPrice, maxDays, minRating,
                PageRequest.of(page, size, sort)).map(this::toResponse);
        return PageResponse.of(result);
    }

    // ─── Get Detail ───────────────────────────────────────
    @Transactional(readOnly = true)
    public ServiceResponse getServiceDetail(Long id) {
        return toResponse(findOrThrow(id));
    }

    // ─── My Services ──────────────────────────────────────
    @Transactional(readOnly = true)
    public PageResponse<ServiceResponse> getMyServices(Long expertId, int page, int size) {
        return PageResponse.of(serviceRepository.findByExpertId(expertId, PageRequest.of(page, size,
                Sort.by("createdAt").descending())).map(this::toResponse));
    }

    // ─── Helpers ──────────────────────────────────────────
    private ExpertService findOrThrow(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", id));
    }

    private Set<Skill> resolveSkills(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return new HashSet<>(skillRepository.findAllById(ids));
    }

    private String toJson(List<String> tags) {
        if (tags == null || tags.isEmpty()) return "[]";
        try { return objectMapper.writeValueAsString(tags); }
        catch (JsonProcessingException e) { return "[]"; }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try { return objectMapper.readValue(json, new TypeReference<>() {}); }
        catch (JsonProcessingException e) { return List.of(); }
    }

    public ServiceResponse toResponse(ExpertService s) {
        var profile = s.getExpert().getProfile();
        var expertInfo = new ServiceResponse.ExpertInfo(
                s.getExpert().getId(),
                profile != null ? profile.getFullName() : null,
                profile != null ? profile.getAvatarUrl() : null,
                profile != null ? profile.getRating() : BigDecimal.ZERO,
                profile != null ? profile.getTotalReviews() : 0
        );
        var skillInfos = s.getSkills().stream()
                .map(sk -> new ServiceResponse.SkillInfo(sk.getId(), sk.getName(), sk.getCategory()))
                .collect(Collectors.toList());

        return new ServiceResponse(s.getId(), s.getTitle(), s.getDescription(), s.getPrice(),
                s.getDeliveryDays(), s.getStatus(), fromJson(s.getTags()), s.getRating(),
                s.getOrderCount(), expertInfo, skillInfos, s.getCreatedAt());
    }
}
