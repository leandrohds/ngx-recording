import { AfterViewInit, Component, EventEmitter, Input, ViewChild } from '@angular/core';

declare var MediaRecorder: any;

@Component({
  selector: 'neo-recording',
  templateUrl: './recording.component.html',
  styleUrls: ['./recording.component.scss']
})
export class RecordingComponent implements AfterViewInit {

  @Input()
  canRecording: boolean = true;

  @Input()
  disabled: boolean = false;

  private chunks: Array<any> = [];
  private stateOfRecorder: RecorderState = RecorderState.PARADO;
  private recorder: any;
  protected recorderEnded = new EventEmitter();
  public recorderError = new EventEmitter<ErrorCase>();

  @ViewChild('caixaAudio')
  caixaAudio: HTMLAudioElement;

  constructor() { }

  ngAfterViewInit(): void {
    console.log(this.caixaAudio);
  }

  async comecarGravar(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.recorder = new MediaRecorder(stream);

    this.addListeners();

    this.recorder.start();

    this.stateOfRecorder = RecorderState.GRAVANDO;
  }

  pausarGravacao(): void {
    this.stateOfRecorder = RecorderState.PAUSADO;

    this.recorder.pause();
  }

  finalizarGravacao(): void {
    this.stateOfRecorder = RecorderState.GRAVADO;
  }

  async converterAudio(toBlob: boolean = false): Promise<any> {

  }

  private addListeners() {
    this.recorder.ondataavailable = this.appendToChunks;
    this.recorder.onstop = this.recordingStopped;
  }

  private recordingStopped = (event: any) => {
    const blob = new Blob(this.chunks, { type: 'audio/webm' });
    this.chunks = [];
    this.recorderEnded.emit(blob);
    this.clear();
  };

  private appendToChunks = (event: any) => {
    this.chunks.push(event.data);
  };

  private clear() {
    this.recorder = null;
    this.chunks = [];
  }

  get isParado(): boolean {
    return this.stateOfRecorder === RecorderState.PARADO;
  }

  get isPausado(): boolean {
    return this.stateOfRecorder === RecorderState.PAUSADO;
  }

  get isGravando(): boolean {
    return this.stateOfRecorder === RecorderState.GRAVANDO;
  }

  get isGravado(): boolean {
    return this.stateOfRecorder === RecorderState.GRAVADO;
  }
}

enum RecorderState {
  PARADO,
  PAUSADO,
  GRAVANDO,
  GRAVADO
}

enum ErrorCase {
  USER_CONSENT_FAILED,
  RECORDER_TIMEOUT,
  ALREADY_RECORDING
}