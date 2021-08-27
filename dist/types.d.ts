import { Request } from 'express';
declare global {
    namespace Express {
        namespace Multer {
            interface File {
                muxUploadId?: string;
            }
        }
    }
}
export declare namespace MulterMuxStorage {
    export interface OutputFile extends Express.Multer.File {
        muxUploadId: string;
    }
    export type HandleCb = (error?: unknown, info?: Partial<OutputFile>) => void;
    export type RemoveCb = (error: Error | null) => void;
    interface OverlaySettings {
        vertical_align?: 'top' | 'middle' | 'bottom';
        vertical_margin?: string;
        horizontal_align?: 'left' | 'center' | 'right';
        horizontal_margin?: string;
        width?: string;
        height?: string;
        opacity?: string;
    }
    interface Input {
        url?: string;
        start_time?: number;
        end_time?: number;
        type?: 'video' | 'audio' | 'text';
        text_type?: 'subtitles' | string;
        language_code?: string;
        name?: string;
        closed_captions: boolean;
        passthrough: string;
        overlay_settings?: OverlaySettings;
    }
    interface NewAssetSettings {
        input?: Input[];
        playback_policy?: ('public' | 'signed')[];
        per_title_encode?: boolean;
        passthrough?: string;
        mp4_support?: 'none' | 'standard';
        normalize_audio?: boolean;
        master_access?: 'none' | 'temporary';
        test?: boolean;
    }
    export interface UploadOptions {
        test?: boolean;
        timeout?: number;
        cors_origin?: string;
        new_asset_settings?: NewAssetSettings;
    }
    export type Constructor = {
        tokenId: string;
        tokenSecret: string;
        allowedMimeTypes: string[];
        getUploadOptions?: (request: Request, file: Express.Multer.File) => Promise<UploadOptions>;
    };
    export {};
}
