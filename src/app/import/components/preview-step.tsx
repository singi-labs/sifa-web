'use client';

import { useMemo, useState } from 'react';
import type { ImportPreview } from '@/lib/import/orchestrator';
import type { ExistingProfileData } from '../page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from '@phosphor-icons/react';
import { PositionsTable } from './positions-table';
import { EducationTable } from './education-table';
import { SkillsList } from './skills-list';
import { ImportItemList } from './import-item-list';

function normalize(s: string | undefined | null): string {
  return (s ?? '').trim().toLowerCase();
}

interface PreviewStepProps {
  preview: ImportPreview;
  existingData: ExistingProfileData | null;
  onConfirm: (preview: ImportPreview) => void;
  onBack: () => void;
}

export function PreviewStep({ preview, existingData, onConfirm, onBack }: PreviewStepProps) {
  const [data, setData] = useState<ImportPreview>(preview);

  const removeFrom = (key: keyof ImportPreview, index: number) => {
    setData((prev) => ({
      ...prev,
      [key]: (prev[key] as unknown[]).filter((_, i) => i !== index),
    }));
  };

  const duplicatePositions = useMemo(() => {
    if (!existingData) return new Set<number>();
    const keys = new Set(
      existingData.positions.map(
        (p) => `${normalize(p.companyName)}|${normalize(p.title)}|${normalize(p.startDate)}`,
      ),
    );
    const dupes = new Set<number>();
    data.positions.forEach((p, i) => {
      if (keys.has(`${normalize(p.companyName)}|${normalize(p.title)}|${normalize(p.startDate)}`)) {
        dupes.add(i);
      }
    });
    return dupes;
  }, [data.positions, existingData]);

  const duplicateEducation = useMemo(() => {
    if (!existingData) return new Set<number>();
    const keys = new Set(
      existingData.education.map((e) => `${normalize(e.institution)}|${normalize(e.degree)}`),
    );
    const dupes = new Set<number>();
    data.education.forEach((e, i) => {
      if (keys.has(`${normalize(e.institution)}|${normalize(e.degree)}`)) {
        dupes.add(i);
      }
    });
    return dupes;
  }, [data.education, existingData]);

  const duplicateSkills = useMemo(() => {
    if (!existingData) return new Set<number>();
    const keys = new Set(existingData.skills.map((s) => normalize(s.skillName)));
    const dupes = new Set<number>();
    data.skills.forEach((s, i) => {
      if (keys.has(normalize(s.skillName))) {
        dupes.add(i);
      }
    });
    return dupes;
  }, [data.skills, existingData]);

  const totalItems =
    (data.profile ? 1 : 0) +
    data.positions.length +
    data.education.length +
    data.skills.length +
    data.certifications.length +
    data.projects.length +
    data.volunteering.length +
    data.publications.length +
    data.courses.length +
    data.honors.length +
    data.languages.length;
  const totalDuplicates = duplicatePositions.size + duplicateEducation.size + duplicateSkills.size;
  const newItems = totalItems - totalDuplicates - (data.profile ? 1 : 0);

  // Only show tabs that have data
  const tabs: { key: string; label: string; count: number }[] = [
    { key: 'positions', label: 'Positions', count: data.positions.length },
    { key: 'education', label: 'Education', count: data.education.length },
    { key: 'skills', label: 'Skills', count: data.skills.length },
    { key: 'certifications', label: 'Certifications', count: data.certifications.length },
    { key: 'projects', label: 'Projects', count: data.projects.length },
    { key: 'volunteering', label: 'Volunteering', count: data.volunteering.length },
    { key: 'publications', label: 'Publications', count: data.publications.length },
    { key: 'courses', label: 'Courses', count: data.courses.length },
    { key: 'honors', label: 'Honors', count: data.honors.length },
    { key: 'languages', label: 'Languages', count: data.languages.length },
  ].filter((t) => t.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review imported data</CardTitle>
      </CardHeader>
      <CardContent>
        {existingData && totalDuplicates > 0 && (
          <div
            className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950"
            role="status"
          >
            <Info
              className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
              weight="fill"
              aria-hidden="true"
            />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Some items already exist on your profile
              </p>
              <p className="mt-1 text-blue-700 dark:text-blue-300">
                {totalDuplicates} {totalDuplicates === 1 ? 'item matches' : 'items match'} your
                existing profile data and will be overwritten.{' '}
                {newItems > 0 && (
                  <>
                    {newItems} {newItems === 1 ? 'item is' : 'items are'} new.{' '}
                  </>
                )}
                You can remove items you don&apos;t want to import.
              </p>
            </div>
          </div>
        )}

        {existingData && totalDuplicates === 0 && (
          <div
            className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950"
            role="status"
          >
            <Info
              className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
              weight="fill"
              aria-hidden="true"
            />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Your profile already has data
              </p>
              <p className="mt-1 text-blue-700 dark:text-blue-300">
                Importing will replace all existing profile data with the data below. Your profile
                headline and summary will also be updated.
              </p>
            </div>
          </div>
        )}

        {data.profile && (
          <div className="mb-6 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Profile</h3>
            <p className="mt-1 text-sm">
              {data.profile.firstName} {data.profile.lastName}
            </p>
            {data.profile.headline && (
              <p className="text-sm text-muted-foreground">{data.profile.headline}</p>
            )}
            {data.profile.location && (
              <p className="text-sm text-muted-foreground">{data.profile.location}</p>
            )}
          </div>
        )}

        <Tabs defaultValue={tabs[0]?.key ?? 'positions'}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label}{' '}
                <Badge variant="secondary" className="ms-1.5">
                  {tab.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="positions">
            <PositionsTable
              positions={data.positions}
              duplicateIndices={duplicatePositions}
              onRemove={(i) => removeFrom('positions', i)}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationTable
              education={data.education}
              duplicateIndices={duplicateEducation}
              onRemove={(i) => removeFrom('education', i)}
            />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsList
              skills={data.skills}
              duplicateIndices={duplicateSkills}
              onRemove={(i) => removeFrom('skills', i)}
            />
          </TabsContent>

          <TabsContent value="certifications">
            <ImportItemList
              items={data.certifications as unknown as Record<string, unknown>[]}
              labelFn={(c) => c.name as string}
              detailFn={(c) => c.authority as string | undefined}
              emptyMessage="No certifications found."
              onRemove={(i) => removeFrom('certifications', i)}
            />
          </TabsContent>

          <TabsContent value="projects">
            <ImportItemList
              items={data.projects as unknown as Record<string, unknown>[]}
              labelFn={(p) => p.name as string}
              detailFn={(p) => p.description as string | undefined}
              emptyMessage="No projects found."
              onRemove={(i) => removeFrom('projects', i)}
            />
          </TabsContent>

          <TabsContent value="volunteering">
            <ImportItemList
              items={data.volunteering as unknown as Record<string, unknown>[]}
              labelFn={(v) => `${v.role ?? 'Volunteer'} at ${v.organization}`}
              detailFn={(v) => v.cause as string | undefined}
              emptyMessage="No volunteering found."
              onRemove={(i) => removeFrom('volunteering', i)}
            />
          </TabsContent>

          <TabsContent value="publications">
            <ImportItemList
              items={data.publications as unknown as Record<string, unknown>[]}
              labelFn={(p) => p.title as string}
              detailFn={(p) => p.publisher as string | undefined}
              emptyMessage="No publications found."
              onRemove={(i) => removeFrom('publications', i)}
            />
          </TabsContent>

          <TabsContent value="courses">
            <ImportItemList
              items={data.courses as unknown as Record<string, unknown>[]}
              labelFn={(c) => c.name as string}
              detailFn={(c) => c.institution as string | undefined}
              emptyMessage="No courses found."
              onRemove={(i) => removeFrom('courses', i)}
            />
          </TabsContent>

          <TabsContent value="honors">
            <ImportItemList
              items={data.honors as unknown as Record<string, unknown>[]}
              labelFn={(h) => h.title as string}
              detailFn={(h) => h.issuer as string | undefined}
              emptyMessage="No honors found."
              onRemove={(i) => removeFrom('honors', i)}
            />
          </TabsContent>

          <TabsContent value="languages">
            <ImportItemList
              items={data.languages as unknown as Record<string, unknown>[]}
              labelFn={(l) => l.name as string}
              detailFn={(l) => l.proficiency as string | undefined}
              emptyMessage="No languages found."
              onRemove={(i) => removeFrom('languages', i)}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} to import
            </span>
            <Button onClick={() => onConfirm(data)} disabled={totalItems === 0}>
              Confirm &amp; Import
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
