package com.aimarket.repository;

import com.aimarket.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    Optional<UserProfile> findByUserId(Long userId);

    /**
     * Returns all EXPERT profiles that already have a skills_embedding stored.
     * Used by AIRecommendationService to build the candidate pool for ranking.
     */
    @Query("""
        SELECT p FROM UserProfile p
        JOIN p.user u
        WHERE u.role = com.aimarket.entity.enums.UserRole.EXPERT
          AND p.skillsEmbedding IS NOT NULL
          AND p.isAvailable = true
        """)
    List<UserProfile> findAllExpertsWithEmbedding();

    /**
     * Returns the skill names associated with a given user.
     * Used to display skills on the recommendation card.
     */
    @Query("""
        SELECT s.name FROM User u
        JOIN u.skills s
        WHERE u.id = :userId
        """)
    List<String> findSkillNamesByUserId(@Param("userId") Long userId);

    /**
     * Fallback query: returns EXPERT profiles whose users possess at least one
     * of the requested skills. Used when embedding API is unavailable.
     */
    @Query("""
        SELECT DISTINCT p FROM UserProfile p
        JOIN p.user u
        JOIN u.skills s
        WHERE u.role = com.aimarket.entity.enums.UserRole.EXPERT
          AND s.id IN :skillIds
          AND p.isAvailable = true
        ORDER BY p.rating DESC
        """)
    List<UserProfile> findExpertsBySkillIds(@Param("skillIds") List<Long> skillIds);
}
