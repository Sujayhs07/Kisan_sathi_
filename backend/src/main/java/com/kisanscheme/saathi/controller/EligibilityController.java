package com.kisanscheme.saathi.controller;

import com.kisanscheme.saathi.evaluator.DeterministicEligibilityEngine;
import com.kisanscheme.saathi.service.SchemeCatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/eligibility")
public class EligibilityController {

    private final SchemeCatalogService schemeCatalogService;
    private final DeterministicEligibilityEngine eligibilityEngine;

    public EligibilityController(SchemeCatalogService schemeCatalogService, DeterministicEligibilityEngine eligibilityEngine) {
        this.schemeCatalogService = schemeCatalogService;
        this.eligibilityEngine = eligibilityEngine;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateEligibility(
            @RequestBody(required = false) Map<String, Object> incomingProfile
    ) {
        Map<String, Object> profile = incomingProfile != null ? incomingProfile : new HashMap<>();
        if (!profile.containsKey("state") || profile.get("state") == null) {
            profile.put("state", "Karnataka");
        }

        List<Map<String, Object>> allSchemes = schemeCatalogService.getAllSchemes(null);
        List<DeterministicEligibilityEngine.SchemeEvaluationResult> evaluationResults =
                eligibilityEngine.evaluateAll(allSchemes, profile);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now().toString());
        response.put("evaluatedCount", evaluationResults.size());
        response.put("profileSummary", Map.of(
                "state", profile.getOrDefault("state", "Karnataka"),
                "district", profile.getOrDefault("district", "Unspecified"),
                "category", profile.getOrDefault("farmerCategory", "small_marginal"),
                "landAcres", profile.getOrDefault("landHoldingAcres", 0)
        ));
        response.put("results", evaluationResults);

        return ResponseEntity.ok(response);
    }
}
