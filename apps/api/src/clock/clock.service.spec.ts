import { Test, TestingModule } from '@nestjs/testing';
import { ClockService } from './clock.service';

describe('ClockService', () => {
  let service: ClockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClockService],
    }).compile();

    service = module.get<ClockService>(ClockService);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fires the callback once fake time is advanced past the delay', () => {
    const callback = jest.fn();

    service.setTimeout(callback, 20000);
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(20000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire before the delay has elapsed', () => {
    const callback = jest.fn();

    service.setTimeout(callback, 20000);
    jest.advanceTimersByTime(19999);

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not fire if cleared before the delay elapses', () => {
    const callback = jest.fn();

    const handle = service.setTimeout(callback, 20000);
    service.clearTimeout(handle);
    jest.advanceTimersByTime(20000);

    expect(callback).not.toHaveBeenCalled();
  });
});
