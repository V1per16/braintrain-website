
def CalcScore(success, total, time, numbers, autoHide):
    print(f"success: {success}\nratio: {success/total}\ntime: {time}\nnumbers: {numbers}\nautohide: {autoHide}")
    autohide_conditional = 100 if autoHide / 100 == 0 else autoHide / 100
    return ((success/total) * 1000) - time + (numbers * 10) - (autohide_conditional)


def hidepointscalc(hide_delay, num_nums):
    auto_hide_points = 1000 if hide_delay == 0 else max(0, 1000*(num_nums*0.8) - (hide_delay / 100) * 100)
    return auto_hide_points

print(hidepointscalc(1000, 5))
