import logging
import os
import signal
import time

from insightiq_worker.db import Worker


def main() -> None:
    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
    worker = Worker.from_env()
    stop = False

    def request_stop(_signum, _frame) -> None:
        nonlocal stop
        stop = True

    signal.signal(signal.SIGTERM, request_stop)
    signal.signal(signal.SIGINT, request_stop)
    idle = float(os.environ.get('WORKER_POLL_SECONDS', '3'))
    logging.getLogger('insightiq.worker').info('worker %s polling postgres', worker.worker_id)
    while not stop:
        if not worker.poll_once():
            time.sleep(idle)


if __name__ == '__main__':
    main()
