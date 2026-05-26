package com.aimarket.repository;

import com.aimarket.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("""
        SELECT m FROM Message m
        JOIN FETCH m.sender s
        LEFT JOIN FETCH s.profile
        WHERE m.contract.id = :contractId
        ORDER BY m.createdAt ASC
        """)
    Page<Message> findByContractId(@Param("contractId") Long contractId, Pageable pageable);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.contract.id = :contractId AND m.sender.id <> :userId AND m.isRead = false")
    int markAsRead(@Param("contractId") Long contractId, @Param("userId") Long userId);

    long countByContractIdAndIsReadFalseAndSenderIdNot(Long contractId, Long userId);
}
