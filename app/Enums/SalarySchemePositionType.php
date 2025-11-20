<?php

namespace App\Enums;

enum SalarySchemePositionType : string
{
    case FD = 'FD';
    case RD = 'RD';
    case ALL = 'ALL';
    case BUYING = 'BUYING';
    case PERSONAL = 'PERSONAL';
}
