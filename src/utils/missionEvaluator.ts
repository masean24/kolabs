import type { ExecutionResult, LabFiles, LabTemplate } from '../types/lab';

export interface CriterionEvaluation {
  id: string;
  label: string;
  mode: 'static' | 'runtime';
  passed: boolean;
}

export interface MissionEvaluationSummary {
  results: CriterionEvaluation[];
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
}

/**
 * Mengevaluasi progres 3 kriteria misi secara Hybrid:
 * - Kriteria `static`: dicek real-time dari kode/blok siswa.
 * - Kriteria `runtime`: diverifikasi dari output/gambar setelah tombol Run ditekan sukses.
 */
export function evaluateMission(
  template: LabTemplate,
  files: LabFiles,
  lastResult: ExecutionResult | null,
  generatedPython?: string
): MissionEvaluationSummary {
  if (template.criteria.length === 0) {
    return {
      results: [],
      passedCount: 0,
      totalCount: 0,
      allPassed: false,
    };
  }

  const results: CriterionEvaluation[] = template.criteria.map((criterion) => {
    let passed = false;
    try {
      if (criterion.mode === 'static' && criterion.checkStatic) {
        passed = Boolean(criterion.checkStatic(files, generatedPython));
      } else if (
        criterion.mode === 'runtime' &&
        criterion.checkRuntime &&
        lastResult &&
        lastResult.track === template.track &&
        lastResult.ok
      ) {
        passed = Boolean(criterion.checkRuntime(lastResult, files));
      }
    } catch {
      passed = false;
    }

    return {
      id: criterion.id,
      label: criterion.label,
      mode: criterion.mode,
      passed,
    };
  });

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return {
    results,
    passedCount,
    totalCount,
    allPassed: totalCount > 0 && passedCount === totalCount,
  };
}
