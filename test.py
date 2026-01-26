from collections import deque

start = tuple([1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0])
target = tuple([1] * len(start))
n = len(start)
MAX_STEPS = 6


def toggle(state, i):
    state = list(state)
    for j in (i, (i - 1) % n, (i + 1) % n):
        state[j] ^= 1
    return tuple(state)


queue = deque([(start, [])])
seen = {start}

while queue:
    state, steps = queue.popleft()

    if state == target:
        print("Solved in", len(steps), "steps")
        print("Indices pressed:", steps)
        break

    if len(steps) == MAX_STEPS:
        continue

    for i in range(n):
        new_state = toggle(state, i)
        if new_state not in seen:
            seen.add(new_state)
            queue.append((new_state, steps + [i]))
