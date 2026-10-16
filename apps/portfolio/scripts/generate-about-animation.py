"""Generate the image-free portrait Lottie and its matching SVG first frame.

Run with Python 3. The illustration uses solid vector paths and sparse,
eased keyframes, with no image assets, masks, expressions or external fonts.
"""

import json
import math
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1] / "src" / "animations"
WIDTH, HEIGHT, FRAMES = 1227, 1536, 480
layers = []
svg_layers = []


def prop(value):
    return {"a": 0, "k": value}


def color(value):
    return [round(int(value[i:i + 2], 16) / 255, 4) for i in (1, 3, 5)]


def bezier_path(source):
    tokens = re.findall(r"[MLCQZ]|-?\d+(?:\.\d+)?", source)
    vertices, incoming, outgoing = [], [], []
    index, command, closed = 0, None, False

    def point():
        nonlocal index
        result = [float(tokens[index]), float(tokens[index + 1])]
        index += 2
        return result

    def vertex(value, control_in=None, control_out=None):
        vertices.append(value)
        incoming.append(control_in or [0, 0])
        outgoing.append(control_out or [0, 0])

    while index < len(tokens):
        if tokens[index] in "MLCQZ":
            command = tokens[index]
            index += 1
        if command == "Z":
            closed = True
            break
        if command == "M":
            vertex(point())
            command = "L"
        elif command == "L":
            vertex(point())
        elif command == "C":
            c1, c2, end = point(), point(), point()
            outgoing[-1] = [c1[i] - vertices[-1][i] for i in (0, 1)]
            vertex(end, [c2[i] - end[i] for i in (0, 1)])
        elif command == "Q":
            control, end = point(), point()
            previous = vertices[-1]
            outgoing[-1] = [(control[i] - previous[i]) * 2 / 3 for i in (0, 1)]
            vertex(end, [(control[i] - end[i]) * 2 / 3 for i in (0, 1)])
        else:
            raise ValueError(command)
    if closed and vertices[-1] == vertices[0]:
        incoming[0] = incoming.pop()
        outgoing.pop()
        vertices.pop()
    return {"c": closed, "v": vertices, "i": incoming, "o": outgoing}


def shape(name, source, fill=None, stroke=None, width=1, opacity=100):
    items = [{"ty": "sh", "ks": prop(bezier_path(part))}
             for part in re.split(r"(?=M)", source) if part.strip()]
    attrs = f'd="{source}" fill="{fill or "none"}"'
    if fill:
        items.append({"ty": "fl", "c": prop(color(fill)), "o": prop(opacity), "r": 1})
    if stroke:
        items.append({"ty": "st", "c": prop(color(stroke)), "o": prop(opacity),
                      "w": prop(width), "lc": 2, "lj": 2})
        attrs += f' stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"'
    if opacity != 100:
        attrs += f' opacity="{opacity / 100}"'
    items.append({"ty": "tr", "p": prop([0, 0]), "a": prop([0, 0]),
                  "s": prop([100, 100]), "r": prop(0), "o": prop(100)})
    return ({"ty": "gr", "nm": name, "it": items}, f"<path {attrs}/>")


def ellipse(name, x, y, rx, ry, fill=None, stroke=None, width=1):
    k = 0.552285
    return shape(name, f"M{x + rx} {y} C{x + rx} {y + k * ry} {x + k * rx} {y + ry} {x} {y + ry} "
                 f"C{x - k * rx} {y + ry} {x - rx} {y + k * ry} {x - rx} {y} "
                 f"C{x - rx} {y - k * ry} {x - k * rx} {y - ry} {x} {y - ry} "
                 f"C{x + k * rx} {y - ry} {x + rx} {y - k * ry} {x + rx} {y} Z",
                 fill, stroke, width)


def keyframes(values, times=None):
    times = times or [0, 120, 240, 360, 480]
    result = []
    for i, (time, value) in enumerate(zip(times, values)):
        frame = {"t": time, "s": value if isinstance(value, list) else [value]}
        if i < len(values) - 1:
            frame.update({"o": {"x": 0.42, "y": 0}, "i": {"x": 0.58, "y": 1}})
        result.append(frame)
    return {"a": 1, "k": result}


def layer(name, shapes, anchor=(0, 0), rotation=None, position=None, scale=None, opacity=None,
          parent=None):
    ks = {"o": opacity or prop(100), "r": rotation or prop(0),
          "p": position or prop(list(anchor)), "a": prop(list(anchor)),
          "s": scale or prop([100, 100])}
    layers.append({"ddd": 0, "ind": len(layers) + 1, "ty": 4, "nm": name,
                   "sr": 1, "ks": ks, "ip": 0, "op": FRAMES, "st": 0,
                   "bm": 0, "shapes": [item[0] for item in reversed(shapes)]})
    if parent is not None:
        layers[-1]["parent"] = parent

    def first(p):
        return p["k"][0]["s"] if p["a"] else p["k"]

    p, s, r, o = first(ks["p"]), first(ks["s"]), first(ks["r"]), first(ks["o"])
    r, o = r[0] if isinstance(r, list) else r, o[0] if isinstance(o, list) else o
    transform = f"translate({p[0]} {p[1]}) rotate({r}) scale({s[0]/100} {s[1]/100}) translate({-anchor[0]} {-anchor[1]})"
    svg_layers.append(f'<g transform="{transform}" opacity="{o/100}">' + "".join(item[1] for item in shapes) + "</g>")
    return layers[-1]["ind"]


# Warm paper and an organic blush field, both flat vector fills.
layer("Paper and blush", [
    shape("Paper", "M0 0 L1227 0 L1227 1536 L0 1536 Z", "#FBF2E6"),
    shape("Blush", "M203 1255 C118 1234 102 1140 153 1052 C210 947 194 884 139 822 C54 725 98 603 224 540 C302 501 305 478 307 416 C312 281 432 213 585 211 C686 210 721 134 826 151 C985 174 1072 286 1032 417 C995 531 1008 549 1100 604 C1218 673 1213 807 1136 927 C1064 1040 1093 1100 1104 1170 C1124 1301 997 1339 957 1470 C935 1540 851 1568 761 1536 L307 1536 C313 1454 373 1362 322 1301 C296 1267 248 1263 203 1255 Z", "#F5D1C0"),
])


def plant(name, base_x, base_y, direction, height, width, palette, amplitude):
    """Two rooted stems, with alternating broad leaves and a separate crown."""
    def coord(x, y):
        return (round(base_x + direction * x, 2), round(base_y - y, 2))

    def pt(x, y):
        return " ".join(map(str, coord(x, y)))

    shapes = []
    for branch in range(2):
        bend = width * (0.4 if branch == 0 else 0.85)
        top = height * (1 if branch == 0 else 0.72)
        shapes.append(shape("Stem", f"M{pt(0, -15)} C{pt(-5, top*.25)} {pt(bend*.4, top*.73)} {pt(bend, top)}", stroke=palette[0], width=4))
        for i in range(7 if branch == 0 else 5):
            t = (i + 0.4) / (7 if branch == 0 else 5)
            x, y = bend * t * t, top * t
            side = 1 if i % 2 else -1
            length = width * (0.82 - t * 0.28)
            dx, dy = side * length, length * (0.48 + t * 0.32)
            # The four-corner cubic leaf keeps the contour soft with very few points.
            source = (f"M{pt(x,y)} C{pt(x+dx*.12,y+dy*.78)} {pt(x+dx*.66,y+dy*1.12)} {pt(x+dx,y+dy)} "
                      f"C{pt(x+dx*.92,y+dy*.37)} {pt(x+dx*.39,y-dy*.12)} {pt(x,y)} Z")
            shapes.append(shape("Leaf", source, palette[1 + i % (len(palette)-1)]))
    parent = layer(name, shapes, (base_x, base_y), keyframes([0, amplitude, 0, -amplitude, 0]))
    # This tip follows a separate slower curve, so it does not move as a rigid branch.
    x, y = width*.4, height
    tip = shape("Crown leaf", f"M{pt(x,y-14)} C{pt(x-32,y+19)} {pt(x-12,y+75)} {pt(x+27,y+106)} C{pt(x+45,y+53)} {pt(x+31,y+6)} {pt(x,y-14)} Z", palette[2])
    layer(name + " crown", [tip], coord(x, y-14),
          keyframes([0, -amplitude*1.4, 0, amplitude*1.4, 0]), parent=parent)


plant("Left rear foliage", 28, 1560, 1, 520, 184, ["#BFC3A1", "#D4D3B4", "#C9CDAE", "#BCC6A3"], 2.4)
plant("Right rear foliage", 1208, 1553, -1, 523, 170, ["#BFC3A1", "#D4D3B4", "#C9CDAE", "#BCC6A3"], -2.5)

# The figure follows the original pose: tousled hair, rectangular glasses,
# sage jumper, one relaxed hand and one hand holding a dark tablet.
person = []


def p(name, source, fill=None, stroke=None, width=1):
    person.append(shape(name, source, fill, stroke, width))


p("Trousers", "M414 1215 C536 1234 711 1249 839 1239 L873 1536 L642 1536 L597 1395 L616 1536 L416 1536 C399 1435 398 1315 414 1215 Z", "#3D3D39")
p("Trouser side", "M799 1245 L839 1239 L873 1536 L840 1536 C831 1442 824 1342 799 1245 Z", "#333530")
p("Trouser folds", "M423 1290 C471 1349 513 1376 553 1389 M542 1267 C532 1323 555 1362 597 1395 M803 1267 C812 1293 819 1321 822 1345", stroke="#30322F", width=4)
p("Relaxed hand", "M324 1277 L380 1289 C378 1320 391 1334 389 1363 L383 1423 C382 1438 366 1442 361 1428 L355 1382 L346 1410 C351 1432 364 1443 381 1450 C397 1459 391 1470 376 1464 C394 1478 389 1488 372 1480 C386 1497 379 1506 360 1493 L328 1471 C318 1465 313 1449 308 1432 L297 1402 C294 1389 302 1366 307 1344 Z", "#F3B782")
p("Hand shadow", "M345 1385 C337 1410 336 1436 349 1457 L378 1485 C361 1481 335 1471 327 1462 L308 1407 C305 1396 310 1376 316 1367 L313 1400 L328 1442 L339 1405 Z", "#DF9B68")
p("Jumper", "M604 541 C626 561 706 558 758 526 C803 554 886 581 930 615 C986 674 1017 745 1038 829 L1060 1003 C1066 1063 1006 1113 953 1146 L853 1206 L844 1256 C724 1281 538 1270 412 1243 L396 1301 C367 1307 339 1299 313 1292 L316 1237 C296 1217 302 1197 310 1173 L331 1069 L339 994 L362 858 C379 784 391 681 428 637 C462 611 557 573 604 541 Z", "#818C6C")
p("Left sleeve shade", "M428 647 C403 741 416 799 440 868 C453 906 447 956 435 994 C437 1043 404 1102 402 1145 C397 1165 406 1184 418 1192 L412 1243 L396 1301 L374 1299 C383 1252 359 1238 364 1205 C384 1129 398 1082 401 1015 C399 934 378 892 388 826 C400 742 397 695 428 647 Z", "#737F5F")
p("Torso shade", "M818 690 C837 780 832 838 811 891 C797 938 808 1012 795 1081 C781 1147 746 1178 722 1204 L839 1231 L867 1139 L892 931 Z", "#788564")
p("Shoulder seam", "M922 619 C878 635 853 675 842 719 C828 766 822 795 834 838 M428 656 C426 744 425 778 443 821", stroke="#6F7D5C", width=4)
p("Jumper folds", "M346 1020 C375 1014 398 1024 423 1041 M342 1041 C369 1040 397 1045 416 1062 M365 983 C383 975 413 977 435 992 M438 1127 C419 1164 433 1190 474 1203", stroke="#6F7D5D", width=5)
p("Jumper hem", "M413 1198 C549 1233 710 1240 847 1215 L844 1256 C721 1281 540 1270 412 1243 Z", "#75825F", "#657352", 2)
for x in range(427, 843, 15):
    y = 1215 + 16 * math.sin((x-427)/416 * math.pi)
    p("Hem rib", f"M{x} {y} L{x-1} {y+30}", stroke="#63714F", width=1.5)
p("Cuff", "M317 1238 C342 1233 374 1238 400 1249 L396 1301 C370 1301 337 1298 313 1292 Z", "#75815F", "#637250", 2)
for x in range(325, 394, 12):
    p("Cuff rib", f"M{x} 1248 L{x-3} 1286", stroke="#637250", width=1.5)

p("Neck", "M592 487 L710 427 C714 468 730 503 758 527 C744 573 659 614 607 590 C619 557 610 526 592 487 Z", "#F1B17C")
p("Neck shadow", "M599 514 C639 521 682 474 710 447 C699 485 654 540 617 556 Z", "#D99562")
p("Collar", "M604 541 C577 548 556 561 559 588 C563 630 631 649 693 625 C743 607 793 567 791 546 L759 527 C754 552 710 580 664 594 C628 607 596 602 591 587 C587 570 593 552 604 541 Z", "#6F7C59", "#62724F", 2)
p("Collar inner", "M604 541 C591 555 583 579 596 593 C615 613 663 608 704 588 C732 575 757 553 759 527", stroke="#5F6E4E", width=3)
for i in range(14):
    x = 577 + i*14
    y = 594 + 28*math.sin(i/13*math.pi)
    p("Collar rib", f"M{x} {y-7} L{x-3} {y+7}", stroke="#62724F", width=1.2)

p("Tablet rim", "M685 825 L903 907 Q916 911 915 926 L910 1228 Q909 1249 889 1244 L624 1175 L662 846 Q665 825 685 825 Z", "#676B69")
p("Tablet", "M689 834 L901 915 Q909 918 908 931 L903 1228 Q901 1238 890 1236 L635 1170 L674 852 Q676 831 689 834 Z", "#494C4C")
p("Tablet fold", "M889 917 L850 1057 L903 1214 L908 931 Z", "#424747")
p("Tablet spine", "M680 840 L642 1166", stroke="#90938A", width=4)

p("Bent sleeve", "M925 623 C984 674 1010 751 1035 838 L1059 991 C1068 1034 1052 1062 1019 1089 C979 1123 928 1153 847 1179 L787 1190 L766 1095 C822 1083 864 1063 906 1024 C887 963 874 921 859 872 C848 822 851 764 869 706 C883 663 902 636 925 623 Z", "#818C6C")
p("Elbow shade", "M1031 928 C1016 931 990 934 966 945 C938 956 919 974 904 994 L905 1024 C880 1049 837 1070 782 1094 L797 1177 C882 1150 959 1112 1009 1066 C1034 1043 1052 1025 1057 997 C1043 968 1039 947 1031 928 Z", "#75825F")
p("Elbow folds", "M904 976 C939 953 987 944 1022 951 M905 992 C950 968 1003 970 1037 986 M909 1012 C932 997 960 992 984 993", stroke="#65764F", width=5)
p("Wrist cuff", "M768 1084 C790 1071 815 1070 831 1085 C849 1111 856 1147 849 1168 C830 1183 810 1188 787 1190 C789 1154 780 1111 768 1084 Z", "#74815E", "#63734F", 2.5)
for i in range(7):
    x = 781+i*8
    p("Wrist rib", f"M{x} 1091 C{x+17} 1117 {x+21} 1146 {x+18} 1170", stroke="#63734F", width=1.3)
p("Holding hand", "M776 1098 C753 1105 740 1082 721 1071 C695 1049 675 1044 651 1051 L636 1054 Q627 1057 631 1066 C634 1078 661 1077 679 1083 C664 1086 647 1084 630 1082 C613 1080 609 1091 609 1101 Q607 1115 624 1122 C614 1135 621 1148 633 1154 Q630 1170 647 1179 C657 1194 682 1198 703 1193 L783 1170 C790 1149 785 1120 776 1098 Z", "#F5BA84")
p("Finger creases", "M624 1122 L651 1132 M633 1154 L654 1164 M647 1179 L665 1186 M639 1066 L663 1070", stroke="#DB9967", width=2.7)

p("Hair behind ear", "M708 317 L782 304 L778 397 L758 444 L747 433 L738 454 L724 414 Z", "#3E342A")
p("Face", "M497 292 C530 280 565 264 591 242 C614 219 635 222 643 216 C651 256 681 277 708 292 L737 346 C744 326 763 319 775 334 C789 351 774 394 756 402 L733 409 C725 452 696 479 667 501 L613 523 C587 529 569 507 546 489 C514 459 498 431 493 406 L481 351 Z", "#F5BB85")
p("Face light", "M508 301 C550 286 612 267 639 236 C651 271 670 290 699 309 L714 379 C713 416 691 455 669 474 C637 500 608 514 591 505 C559 483 531 449 521 414 Z", "#F8C590")
p("Jaw shade", "M714 409 C702 455 656 495 613 523 C591 528 569 506 552 492 C588 511 620 502 653 482 C680 464 698 441 714 409 Z", "#E8A574")
p("Ear", "M738 346 C751 323 773 327 777 347 C781 367 768 390 752 397 L735 397 Z", "#F1B17A")
p("Ear crease", "M744 369 C745 350 758 340 763 350 C767 359 758 361 756 368 C765 375 756 382 748 382", stroke="#DC9662", width=4)
p("Nose", "M567 374 L560 408 C559 421 572 430 589 423", stroke="#D7925D", width=3.5)
p("Smile", "M576 456 C594 464 622 451 636 439", stroke="#AE704A", width=3.8)
p("Eyebrow left", "M501 340 C512 330 529 327 540 333 C526 334 512 337 501 343 Z", "#4A392A")
p("Eyebrow right", "M605 315 C616 302 644 301 658 312 C642 309 621 312 605 320 Z", "#4A392A")
person.append(ellipse("Left eye", 540, 376, 10, 15, "#382F26"))
person.append(ellipse("Right eye", 637, 356, 10.5, 15, "#382F26"))
person.append(ellipse("Left catchlight", 537, 371, 2.2, 3.1, "#FFF6E9"))
person.append(ellipse("Right catchlight", 634, 351, 2.2, 3.1, "#FFF6E9"))
p("Glasses bridge", "M560 365 C569 352 579 348 591 355 M677 339 L733 333 M474 373 L466 362", stroke="#414740", width=7)
p("Left lens", "M478 371 C495 361 526 352 548 353 C559 353 564 367 562 384 L558 405 C554 415 525 420 503 419 C491 418 486 405 482 390 Z", stroke="#414740", width=6.5)
p("Right lens", "M592 347 C611 336 647 328 668 330 C679 331 680 343 678 357 L676 377 C671 390 645 396 622 398 C606 401 600 391 596 378 L589 359 Q586 352 592 347 Z", stroke="#414740", width=6.5)
p("Lens glints", "M489 377 L497 397 M602 351 L608 369", stroke="#FFF1DD", width=3)

p("Hair", "M490 354 C467 341 471 320 462 314 C451 331 440 330 437 309 C427 291 444 283 446 271 C431 289 417 288 417 276 C427 277 438 263 441 250 C429 261 422 263 422 254 C422 231 440 215 463 207 C442 195 449 173 459 169 C455 185 475 181 486 176 C498 174 511 169 522 163 C504 165 493 155 501 143 C511 158 527 158 544 151 C527 147 530 140 547 137 C564 132 586 132 607 140 C590 132 583 123 601 126 C626 128 650 137 667 149 C672 141 668 133 664 125 C689 132 710 144 707 163 C728 150 750 157 758 170 C738 168 726 173 717 181 C748 177 776 194 785 218 C772 211 763 208 751 209 C771 222 790 237 790 255 C778 248 772 247 766 245 C777 260 790 270 801 267 C800 280 792 284 783 281 C790 295 789 309 784 325 C780 319 774 319 770 319 C750 313 737 327 731 341 L725 358 L714 356 L707 314 C684 307 655 282 646 247 L640 224 C624 257 602 280 575 285 C580 277 584 269 587 264 C565 284 545 294 518 295 C521 287 525 282 529 276 C513 290 504 299 489 301 C488 321 492 337 490 354 Z", "#40352A")
p("Hair planes", "M449 253 C490 213 552 200 608 166 C564 209 526 243 481 264 C466 270 450 273 439 270 C447 266 450 262 449 253 Z", "#493B2D")
p("Hair crown", "M521 165 C555 149 584 150 607 160 C580 165 559 179 539 190 C548 178 539 172 521 165 Z", "#4C3E2E")
p("Hair sweep", "M649 178 C680 173 717 197 733 220 C746 238 756 255 771 267 C739 256 724 239 711 219 C690 194 672 183 649 178 Z", "#493B2D")
p("Hair strands", "M469 230 C505 216 545 193 575 172 M486 277 C527 261 563 235 589 205 M680 157 C694 168 701 177 705 190 M737 285 C718 274 696 252 684 228", stroke="#584532", width=2)
layer("Portrait", person)

plant("Left foreground foliage", -23, 1552, 1, 699, 164, ["#869477", "#9CA787", "#879575", "#B1B99A"], 3.2)
plant("Right foreground foliage", 1250, 1547, -1, 638, 158, ["#869477", "#9CA787", "#879575", "#B1B99A"], -3.4)

arch = "M249 662 L249 354 C249 192 424 74 643 74 C862 74 1035 192 1035 354 L1035 661"
layer("Architectural arch", [shape("Arch", arch, stroke="#A4AF9B", width=1.6)])


def star(x, y, radius):
    return (f"M{x} {y-radius} C{x+radius*.2} {y-radius*.2} {x+radius*.2} {y-radius*.2} {x+radius} {y} "
            f"C{x+radius*.2} {y+radius*.2} {x+radius*.2} {y+radius*.2} {x} {y+radius} "
            f"C{x-radius*.2} {y+radius*.2} {x-radius*.2} {y+radius*.2} {x-radius} {y} "
            f"C{x-radius*.2} {y-radius*.2} {x-radius*.2} {y-radius*.2} {x} {y-radius} Z")


for i, (x, y, radius) in enumerate([(241, 662, 29), (974, 355, 27)]):
    layer("Gold star", [shape("Star", star(x, y, radius), "#D4A153")], (x, y),
          scale=keyframes([[100, 100], [84, 84], [100, 100], [112, 112], [100, 100]]),
          opacity=keyframes([100, 72, 100, 83, 100]))
    layer("Fine halo", [ellipse("Halo", x, y, radius+9, radius+9, stroke="#DDB777", width=1.1)],
          (x, y), opacity=keyframes([55, 20, 55, 35, 55]))

for i, (x, y, radius) in enumerate([(241, 441, 7), (1095, 490, 7), (226, 834, 7), (1114, 573, 2.3), (907, 202, 2.3)]):
    dy = 10 if i % 2 else -8
    layer("Floating gold mote", [ellipse("Mote", x, y, radius, radius, "#D4A153")],
          (x, y), position=keyframes([[x, y], [x+3, y+dy], [x, y], [x-3, y-dy], [x, y]]))


def rounded(value):
    if isinstance(value, float):
        value = round(value, 2)
        return int(value) if value.is_integer() else value
    if isinstance(value, list):
        return [rounded(v) for v in value]
    if isinstance(value, dict):
        return {k: rounded(v) for k, v in value.items()}
    return value


animation = rounded({"v": "5.13.0", "fr": 30, "ip": 0, "op": FRAMES,
                     "w": WIDTH, "h": HEIGHT, "nm": "ARKAES / Quiet growth / Vector",
                     "ddd": 0, "assets": [], "layers": list(reversed(layers))})
ROOT.mkdir(parents=True, exist_ok=True)
(ROOT / "about-quiet-growth.json").write_text(json.dumps(animation, separators=(",", ":")) + "\n")
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" viewBox="0 0 {WIDTH} {HEIGHT}" fill="none">'
       '<title>Ahmad Naufal with a tablet, surrounded by sage foliage</title>'
       + "".join(svg_layers) + "</svg>\n")
svg = re.sub(r"-?\d+\.\d+", lambda m: str(round(float(m.group()), 2)), svg)
(ROOT / "about-quiet-growth-poster.svg").write_text(svg)
print("Lottie:", (ROOT / "about-quiet-growth.json").stat().st_size, "bytes")
print("Poster:", (ROOT / "about-quiet-growth-poster.svg").stat().st_size, "bytes")
