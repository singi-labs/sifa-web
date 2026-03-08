'use client';

import { useState } from 'react';
import type { ImportPreview } from '@/lib/import/orchestrator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
            {data.positions.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No positions found in export.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.positions.map((pos, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{pos.title}</TableCell>
                      <TableCell>{pos.companyName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {pos.startDate ?? '?'} &ndash;{' '}
                        {pos.current ? 'Present' : (pos.endDate ?? '?')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="xs" onClick={() => removePosition(i)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="education">
            {data.education.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No education found in export.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Institution</TableHead>
                    <TableHead>Degree</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.education.map((edu, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{edu.institution}</TableCell>
                      <TableCell>{edu.degree ?? ''}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {edu.startDate ?? '?'} &ndash; {edu.endDate ?? '?'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="xs" onClick={() => removeEducation(i)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="skills">
            {data.skills.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No skills found in export.</p>
            ) : (
              <div className="flex flex-wrap gap-2 py-4">
                {data.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="gap-1.5">
                    {skill.skillName}
                    <button
                      type="button"
                      className="ms-1 text-muted-foreground hover:text-foreground"
                      onClick={() => removeSkill(i)}
                      aria-label={`Remove ${skill.skillName}`}
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
            )}
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
