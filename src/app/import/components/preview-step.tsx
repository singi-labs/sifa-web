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

  const removePosition = (index: number) => {
    setData((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== index),
    }));
  };

  const removeEducation = (index: number) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const removeSkill = (index: number) => {
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
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

  const extendedCount =
    data.certifications.length +
    data.projects.length +
    data.volunteering.length +
    data.publications.length +
    data.courses.length +
    data.honors.length +
    data.languages.length;

  const totalItems =
    (data.profile ? 1 : 0) +
    data.positions.length +
    data.education.length +
    data.skills.length +
    extendedCount;
  const totalDuplicates = duplicatePositions.size + duplicateEducation.size + duplicateSkills.size;
  const newItems = totalItems - totalDuplicates - (data.profile ? 1 : 0);

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
                Importing will replace all existing positions, education, and skills with the data
                below. Your profile headline and summary will also be updated.
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

        <Tabs defaultValue="positions">
          <TabsList>
            <TabsTrigger value="positions">
              Positions{' '}
              <Badge variant="secondary" className="ms-1.5">
                {data.positions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="education">
              Education{' '}
              <Badge variant="secondary" className="ms-1.5">
                {data.education.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="skills">
              Skills{' '}
              <Badge variant="secondary" className="ms-1.5">
                {data.skills.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="positions">
            <PositionsTable
              positions={data.positions}
              duplicateIndices={duplicatePositions}
              onRemove={removePosition}
            />
          </TabsContent>

          <TabsContent value="education">
            <EducationTable
              education={data.education}
              duplicateIndices={duplicateEducation}
              onRemove={removeEducation}
            />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsList
              skills={data.skills}
              duplicateIndices={duplicateSkills}
              onRemove={removeSkill}
            />
          </TabsContent>
        </Tabs>

        {extendedCount > 0 && (
          <div className="mt-4 rounded-lg border p-4">
            <h3 className="text-sm font-semibold">Also importing</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {data.certifications.length > 0 && (
                <Badge variant="outline">Certifications ({data.certifications.length})</Badge>
              )}
              {data.projects.length > 0 && (
                <Badge variant="outline">Projects ({data.projects.length})</Badge>
              )}
              {data.volunteering.length > 0 && (
                <Badge variant="outline">Volunteering ({data.volunteering.length})</Badge>
              )}
              {data.publications.length > 0 && (
                <Badge variant="outline">Publications ({data.publications.length})</Badge>
              )}
              {data.courses.length > 0 && (
                <Badge variant="outline">Courses ({data.courses.length})</Badge>
              )}
              {data.honors.length > 0 && (
                <Badge variant="outline">Honors ({data.honors.length})</Badge>
              )}
              {data.languages.length > 0 && (
                <Badge variant="outline">Languages ({data.languages.length})</Badge>
              )}
            </div>
          </div>
        )}

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
