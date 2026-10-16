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
details = json.loads((ROOT / "about-portrait-details.json").read_text())


def p(name, source, fill=None, stroke=None, width=1):
    person.append(shape(name, source, fill, stroke, width))


def detail(name):
    # Simplified reference contours keep the facial features and hand anatomy.
    for item in details[name]:
        p("Reference / " + name, item["path"], item["fill"])


p("Trousers", "M414 1215 C536 1234 711 1249 839 1239 L873 1536 L642 1536 L597 1395 L616 1536 L416 1536 C399 1435 398 1315 414 1215 Z", "#3D3D39")
p("Trouser side", "M799 1245 L839 1239 L873 1536 L840 1536 C831 1442 824 1342 799 1245 Z", "#333530")
p("Trouser folds", "M423 1290 C471 1349 513 1376 553 1389 M542 1267 C532 1323 555 1362 597 1395 M803 1267 C812 1293 819 1321 822 1345", stroke="#30322F", width=4)
detail("relaxed")
p("Relaxed thumb crease", "M350 1390 C340 1407 342 1426 355 1439 C364 1448 375 1452 383 1450", stroke="#D99863", width=2.5)
p("Thumbnail", "M365 1428 C366 1421 377 1421 379 1428 L378 1436 C375 1441 368 1440 366 1435 Z", "#F9CD9F", "#DEA16F", 1.4)
p("Relaxed finger crease", "M327 1440 C332 1452 346 1465 363 1470", stroke="#D99863", width=2.2)
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

# One shallow crew-neck band follows the shoulders. The reference neck is
# painted over its opening, so skin and knit meet along the same contour.
p("Crew neck band", "M601 541 C578 547 556 566 558 590 C561 618 595 639 639 639 C697 638 759 606 785 568 C798 551 793 541 759 525 C719 549 647 571 601 541 Z", "#74815F")
p("Crew neck seam", "M566 591 C572 625 615 644 666 631 C717 620 765 589 786 556", stroke="#637350", width=2.4)

def cubic(a, b, c, d, t):
    return [sum(weight * point[i] for weight, point in zip(
        [(1-t)**3, 3*(1-t)**2*t, 3*(1-t)*t*t, t**3], [a, b, c, d]))
        for i in (0, 1)]

for i in range(1, 16):
    t = i / 17
    inner = cubic((592, 588), (609, 617), (685, 605), (760, 543), t)
    outer = cubic((566, 593), (578, 651), (711, 644), (788, 552), t)
    start = [round(inner[j]*.7 + outer[j]*.3, 2) for j in (0, 1)]
    end = [round(inner[j]*.2 + outer[j]*.8, 2) for j in (0, 1)]
    p("Collar rib", f"M{start[0]} {start[1]} L{end[0]} {end[1]}", stroke="#657553", width=1.3)

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
detail("holding")
p("Thumb crease", "M637 1072 C649 1079 664 1079 677 1084", stroke="#D99A68", width=2.3)
p("Finger creases", "M614 1114 C625 1118 637 1123 649 1128 M621 1141 C630 1146 643 1150 654 1155 M635 1168 C644 1174 652 1178 663 1182", stroke="#D99A68", width=2.4)
p("Palm crease", "M752 1118 C766 1129 770 1147 766 1159", stroke="#E6AA77", width=2)

# Smooth face and neck silhouettes meet below the jaw. A single neck shadow
# gives depth without adding a second outline along the chin.
p("Hair behind ear", "M724 374 L769 365 C771 398 758 427 746 440 L739 430 L731 443 L724 412 Z", "#40352A")
p("Neck", "M600 493 L709 440 C714 472 736 512 759 528 C751 553 710 583 666 596 C637 608 610 608 596 594 C590 584 599 560 608 548 C611 533 608 514 600 493 Z", "#F6BF88")
p("Neck shade", "M604 515 C637 512 678 482 705 461 C687 502 651 537 617 551 L615 563 C612 546 610 530 604 515 Z", "#E0A06E")
p("Face", "M491 307 C541 292 608 263 642 223 C649 260 678 287 708 299 L733 345 C747 326 766 322 777 338 C788 359 771 386 753 398 L734 403 C744 438 725 477 691 500 C661 526 625 545 598 531 C563 519 533 499 512 476 C488 450 474 422 475 394 L479 350 C477 331 484 317 491 307 Z", "#F6BF88")
# Reference curves retain the familiar eyebrows, ear and soft smile.
detail("face")
p("Nose", "M568 375 L562 410 C562 421 576 427 588 422", stroke="#DA9B68", width=3)
person.append(ellipse("Left eye", 540, 376, 10, 15, "#3D3024"))
person.append(ellipse("Right eye", 637, 356, 10, 15, "#3D3024"))
person.append(ellipse("Left catchlight", 536, 370, 2.1, 3.1, "#FFF0D8"))
person.append(ellipse("Right catchlight", 633, 350, 2.1, 3.1, "#FFF0D8"))
p("Glasses bridge", "M561 365 C569 355 580 350 590 355 M680 337 L732 331", stroke="#454A42", width=7)
p("Left lens", "M475 368 C490 358 520 351 542 352 C553 352 560 355 561 368 L561 390 C560 403 555 412 545 416 C532 420 513 423 500 420 C490 418 487 413 483 400 L477 383 C474 376 472 372 475 368 Z", stroke="#454A42", width=6.5)
p("Right lens", "M591 343 C610 333 646 325 668 327 C678 328 682 335 680 349 L678 375 C676 388 666 393 652 396 L623 400 C609 401 602 397 598 385 L588 359 Q584 349 591 343 Z", stroke="#454A42", width=6.5)

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
