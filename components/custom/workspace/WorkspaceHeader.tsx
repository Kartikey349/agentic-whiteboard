"use client";

import Image from "next/image";
import Link from "next/link";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import {
  Download,
  Loader2,
  MoreVertical,
  Save,
  Share,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ThemeToggle from "@/components/ThemeToggle";

type Prop = {
  selectedTab: any;
  onExport: any;
  onSave: () => void;
  onShare: () => void;
  projectName: string;
  isSharing: boolean;
};

const WorkspaceHeader = ({
  selectedTab,
  onExport,
  projectName,
  onSave,
  onShare,
  isSharing,
}: Prop) => {
  return (
    <div className="p-3 border-b flex justify-between items-center gap-2">
      {/* Left */}
      <div className="flex gap-2 items-center min-w-0">
        <Link href="/dashboard" className="shrink-0">
          <Image
            src="/logo.svg"
            alt="logo"
            width={40}
            height={40}
          />
        </Link>

        <h2 className="font-semibold truncate max-w-[120px] sm:max-w-none">
          {projectName}
        </h2>
      </div>

      {/* Center */}
      <div className="hidden sm:block">
        <Tabs
          defaultValue="Whiteboard"
          onValueChange={(value) => selectedTab(value)}
        >
          <TabsList>
            <TabsTrigger value="Whiteboard">
              Whiteboard
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Right */}
      <div className="flex gap-2 items-center shrink-0">
        {/* Theme */}
        <ThemeToggle />

        {/* Save - ALWAYS VISIBLE */}
        <Button onClick={onSave}>
          <Save />
          Save
        </Button>

        {/* Share - Desktop */}
        <Button
          variant="outline"
          onClick={onShare}
          disabled={isSharing}
          className="hidden sm:flex"
        >
          {isSharing ? (
            <>
              <Loader2 className="animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Share />
              Share
            </>
          )}
        </Button>

        {/* Export - Desktop */}
        <Button
          onClick={onExport}
          className="hidden sm:flex"
        >
          <Download />
          Export
        </Button>

        {/* Mobile Menu */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {/* Share */}
              <DropdownMenuItem
                onClick={onShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </>
                )}
              </DropdownMenuItem>

              {/* Export */}
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceHeader;