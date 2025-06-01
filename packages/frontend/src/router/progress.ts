import { ref } from "vue";

export class Loader {
  public static current = ref(0);
  public static isLoading = ref(false);
  private static transform = (x: number, rate: number = 0.01) => {
    if (x < 60) {
      return x + 1;
    }
    if (x > 60 && x < 70) {
      return x + (x - 60) * rate;
    }

    return x + 0.01;
  };

  private static interval: any;
  private static finishedInterval: any;

  private static clearIntervals() {
    clearInterval(this.interval);
    clearInterval(this.finishedInterval);
  }

  public static start() {
    this.isLoading.value = true;
    this.clearIntervals();
    this.interval = setInterval(() => {
      this.current.value = Math.min(80, this.transform(this.current.value));
    }, 10);
  }

  public static stop() {
    this.clearIntervals();
    this.finishedInterval = setInterval(() => {
      this.current.value = Math.min(100, this.current.value + 2.5);
      if (this.current.value === 100) {
        this.isLoading.value = false;
        this.current.value = 0;
        clearInterval(this.finishedInterval);
      }
    }, 10);
  }
}
