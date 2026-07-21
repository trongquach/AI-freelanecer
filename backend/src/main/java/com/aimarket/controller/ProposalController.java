package com.aimarket.controller;

import com.aimarket.dto.proposal.*;
import com.aimarket.security.CustomUserDetails;
import com.aimarket.service.ProposalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Proposals", description = "Job proposal & interview management")
@RestController
@RequestMapping("/api/v1/proposals")
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;

    // ── Expert: Nộp đơn ──────────────────────────────────────

    @Operation(summary = "Expert nộp đơn ứng tuyển. AI sẽ sàng lọc CV tự động.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('EXPERT')")
    public ProposalResponse submit(@Valid @RequestBody SubmitProposalRequest request,
                                   @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.submit(request, user.getUserId());
    }

    @Operation(summary = "Expert xem các đơn đã nộp của mình")
    @GetMapping("/my")
    @PreAuthorize("hasRole('EXPERT')")
    public Page<ProposalResponse> myProposals(@AuthenticationPrincipal CustomUserDetails user,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return proposalService.myProposals(user.getUserId(), page, size);
    }

    @Operation(summary = "Expert rút đơn ứng tuyển")
    @PostMapping("/{id}/withdraw")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('EXPERT')")
    public void withdraw(@PathVariable Long id,
                         @AuthenticationPrincipal CustomUserDetails user) {
        proposalService.withdraw(id, user.getUserId());
    }

    // ── Client: Xem CV đã qua AI sàng lọc ───────────────────

    @Operation(summary = "Client xem CV đã qua AI sàng lọc — sắp xếp theo điểm AI giảm dần")
    @GetMapping("/job/{jobId}/screened")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public Page<ProposalResponse> listScreenedForJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return proposalService.listPassedForJob(jobId, user.getUserId(), page, size);
    }

    @Operation(summary = "Client xem danh sách ứng viên đang ở vòng phỏng vấn")
    @GetMapping("/job/{jobId}/interview")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public List<ProposalResponse> listInterviewCandidates(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.listInterviewCandidates(jobId, user.getUserId());
    }

    @Operation(summary = "Tất cả proposals của job — Admin/Client owner")
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAnyRole('CLIENT','ADMIN')")
    public Page<ProposalResponse> listForJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return proposalService.listForJob(jobId, user.getUserId(), page, size);
    }

    // ── Client: Quản lý vòng phỏng vấn ──────────────────────

    @Operation(summary = "Client mời ứng viên vào vòng phỏng vấn (SHORTLIST). Giới hạn theo maxShortlist của Job.")
    @PostMapping("/{id}/shortlist")
    @PreAuthorize("hasRole('CLIENT')")
    public ProposalResponse shortlist(@PathVariable Long id,
                                      @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.shortlist(id, user.getUserId());
    }

    @Operation(summary = "Client đánh dấu đã phỏng vấn xong + ghi chú kết quả")
    @PostMapping("/{id}/interviewed")
    @PreAuthorize("hasRole('CLIENT')")
    public ProposalResponse markInterviewed(@PathVariable Long id,
                                            @Valid @RequestBody InterviewNoteRequest request,
                                            @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.markInterviewed(id, user.getUserId(), request.notes());
    }

    // ── Client: Chốt ứng viên ────────────────────────────────

    @Operation(summary = "Client chốt ứng viên → tạo Hợp Đồng. Chỉ áp dụng cho ứng viên đã phỏng vấn (INTERVIEWED).")
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('CLIENT')")
    public ProposalResponse accept(@PathVariable Long id,
                                   @Valid @RequestBody AcceptProposalRequest request,
                                   @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.accept(id, request, user.getUserId());
    }

    @Operation(summary = "Client từ chối ứng viên")
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLIENT')")
    public ProposalResponse reject(@PathVariable Long id,
                                   @AuthenticationPrincipal CustomUserDetails user) {
        return proposalService.reject(id, user.getUserId());
    }
}
