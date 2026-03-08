'use client';

import { useState } from 'react';
import type { ImportPreview } from '@/lib/import/orchestrator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PositionsTable } from './positions-table';
import { EducationTable } from './education-table';
import { SkillsList } from './skills-list';

interface PreviewStepProps {
  preview: ImportPreview;
  onConfirm: (preview: ImportPreview) => void;
  onBack: () => void;
}

export function PreviewStep({ preview, onConfirm, onBack }: PreviewStepProps) {
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

  const totalItems =
    (data.profile ? 1 : 0) + data.positions.length + data.education.length + data.skills.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review imported data</CardTitle>
      </CardHeader>
      <CardContent>
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
            <PositionsTable positions={data.positions} onRemove={removePosition} />
          </TabsContent>

          <TabsContent value="education">
            <EducationTable education={data.education} onRemove={removeEducation} />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsList skills={data.skills} onRemove={removeSkill} />
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
