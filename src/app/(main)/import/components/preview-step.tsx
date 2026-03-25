'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ImportPreview } from '@/lib/import/orchestrator';
import type { ExistingProfileData } from '../page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Eye } from '@phosphor-icons/react';
import { PositionsTable } from './positions-table';
import { EducationTable } from './education-table';
import { SkillsList } from './skills-list';
import { ImportItemList } from './import-item-list';
import { formatLocation } from '@/lib/location-utils';

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
  const t = useTranslations('import.preview');
  const [data, setData] = useState<ImportPreview>(preview);
  const [isConfirming, setIsConfirming] = useState(false);

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
        (p) => `${normalize(p.company)}|${normalize(p.title)}|${normalize(p.startedAt)}`,
      ),
    );
    const dupes = new Set<number>();
    data.positions.forEach((p, i) => {
      if (keys.has(`${normalize(p.company)}|${normalize(p.title)}|${normalize(p.startedAt)}`)) {
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
    const keys = new Set(existingData.skills.map((s) => normalize(s.name)));
    const dupes = new Set<number>();
    data.skills.forEach((s, i) => {
      if (keys.has(normalize(s.name))) {
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
        <CardTitle>{t('heading')}</CardTitle>
      </CardHeader>
      <CardContent>
        {existingData && totalDuplicates > 0 && (
          <div className="mb-6 flex gap-3 rounded-lg border bg-muted/50 p-4" role="status">
            <Info
              className="mt-0.5 size-5 shrink-0 text-primary"
              weight="fill"
              aria-hidden="true"
            />
            <div className="text-sm">
              <p className="font-medium">{t('duplicatesTitle')}</p>
              <p className="mt-1 text-muted-foreground">
                {t('duplicatesBody', { count: totalDuplicates })}{' '}
                {newItems > 0 && <>{t('newItemsNote', { count: newItems })} </>}
                {t('removeNote')}
              </p>
            </div>
          </div>
        )}

        {existingData && totalDuplicates === 0 && (
          <div className="mb-6 flex gap-3 rounded-lg border bg-muted/50 p-4" role="status">
            <Info
              className="mt-0.5 size-5 shrink-0 text-primary"
              weight="fill"
              aria-hidden="true"
            />
            <div className="text-sm">
              <p className="font-medium">{t('existingTitle')}</p>
              <p className="mt-1 text-muted-foreground">{t('existingBody')}</p>
            </div>
          </div>
        )}

        {data.profile && (
          <div className="mb-6 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">{t('profile')}</h3>
            <p className="mt-1 text-sm">
              {data.profile.firstName} {data.profile.lastName}
            </p>
            {data.profile.headline && (
              <p className="text-sm text-muted-foreground">{data.profile.headline}</p>
            )}
            {data.profile.location && (
              <p className="text-sm text-muted-foreground">
                {formatLocation(data.profile.location)}
              </p>
            )}
          </div>
        )}

        <Tabs defaultValue={tabs[0]?.key ?? 'positions'}>
          <TabsList className="flex flex-wrap !h-auto gap-1 mb-3">
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
              items={data.certifications}
              labelFn={(c) => c.name}
              detailFn={(c) => c.authority}
              emptyMessage="No certifications found."
              onRemove={(i) => removeFrom('certifications', i)}
            />
          </TabsContent>

          <TabsContent value="projects">
            <ImportItemList
              items={data.projects}
              labelFn={(p) => p.name}
              detailFn={(p) => p.description}
              emptyMessage="No projects found."
              onRemove={(i) => removeFrom('projects', i)}
            />
          </TabsContent>

          <TabsContent value="volunteering">
            <ImportItemList
              items={data.volunteering}
              labelFn={(v) => `${v.role ?? 'Volunteer'} at ${v.organization}`}
              detailFn={(v) => v.cause}
              emptyMessage="No volunteering found."
              onRemove={(i) => removeFrom('volunteering', i)}
            />
          </TabsContent>

          <TabsContent value="publications">
            <ImportItemList
              items={data.publications}
              labelFn={(p) => p.title}
              detailFn={(p) => p.publisher}
              emptyMessage="No publications found."
              onRemove={(i) => removeFrom('publications', i)}
            />
          </TabsContent>

          <TabsContent value="courses">
            <ImportItemList
              items={data.courses}
              labelFn={(c) => c.name}
              detailFn={(c) => c.number}
              emptyMessage="No courses found."
              onRemove={(i) => removeFrom('courses', i)}
            />
          </TabsContent>

          <TabsContent value="honors">
            <ImportItemList
              items={data.honors}
              labelFn={(h) => h.title}
              detailFn={(h) => h.description}
              emptyMessage="No honors found."
              onRemove={(i) => removeFrom('honors', i)}
            />
          </TabsContent>

          <TabsContent value="languages">
            <ImportItemList
              items={data.languages}
              labelFn={(l) => l.name}
              detailFn={(l) => l.proficiency}
              emptyMessage="No languages found."
              onRemove={(i) => removeFrom('languages', i)}
            />
          </TabsContent>
        </Tabs>

        <div
          className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
          role="note"
        >
          <Eye
            className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
            weight="fill"
            aria-hidden="true"
          />
          <p className="text-sm text-amber-800 dark:text-amber-300">{t('publicDataNotice')}</p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            {t('back')}
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {t('itemCount', { count: totalItems })}
            </span>
            <Button
              onClick={() => {
                setIsConfirming(true);
                onConfirm(data);
              }}
              disabled={totalItems === 0 || isConfirming}
            >
              {isConfirming ? t('confirming') : t('confirmButton')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
